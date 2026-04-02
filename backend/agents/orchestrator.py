"""
LangGraph Agent Orchestrator
============================
Defines the main workflow graph that coordinates all agents.
Uses LangGraph for state management and conditional routing.
"""

import asyncio
from typing import Literal
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

from state.schemas import AgentState, AgentType, AgentEventStatus
from .scout import scout_agent
from .analyzer import analyzer_agent
from .writer import writer_agent
from .coach import coach_agent
from .reporter import reporter_agent


def should_continue_after_scout(state: AgentState) -> Literal["analyzer", "end"]:
    """Decide if we should analyze jobs or stop."""
    if state.should_stop:
        return "end"
    if state.discovered_jobs:
        return "analyzer"
    return "end"


def should_continue_after_analyzer(state: AgentState) -> Literal["writer", "reporter", "end"]:
    """Decide next step after analysis."""
    if state.should_stop:
        return "end"
    
    # If we have high-match jobs, generate materials
    high_match_jobs = [j for j in state.scored_jobs if j.scores and j.scores.composite >= 80]
    if high_match_jobs:
        return "writer"
    
    # Otherwise, just report
    return "reporter"


def should_continue_after_writer(state: AgentState) -> Literal["reporter", "end"]:
    """After writing, always report."""
    if state.should_stop:
        return "end"
    return "reporter"


def create_agent_graph() -> StateGraph:
    """
    Create the main LangGraph workflow.
    
    Flow:
    1. Scout -> finds jobs from various sources
    2. Analyzer -> scores and ranks jobs
    3. Writer -> generates resumes/cover letters for top matches
    4. Reporter -> compiles daily digest
    
    Coach agent is triggered separately (on-demand).
    """
    # Create the graph with AgentState
    workflow = StateGraph(AgentState)
    
    # Add agent nodes
    workflow.add_node("scout", scout_agent)
    workflow.add_node("analyzer", analyzer_agent)
    workflow.add_node("writer", writer_agent)
    workflow.add_node("reporter", reporter_agent)
    
    # Set entry point
    workflow.set_entry_point("scout")
    
    # Add conditional edges
    workflow.add_conditional_edges(
        "scout",
        should_continue_after_scout,
        {
            "analyzer": "analyzer",
            "end": END,
        }
    )
    
    workflow.add_conditional_edges(
        "analyzer",
        should_continue_after_analyzer,
        {
            "writer": "writer",
            "reporter": "reporter",
            "end": END,
        }
    )
    
    workflow.add_conditional_edges(
        "writer",
        should_continue_after_writer,
        {
            "reporter": "reporter",
            "end": END,
        }
    )
    
    # Reporter always ends the workflow
    workflow.add_edge("reporter", END)
    
    return workflow


def create_interview_graph() -> StateGraph:
    """
    Create a separate graph for interview preparation.
    This is triggered on-demand by the user.
    """
    workflow = StateGraph(AgentState)
    
    workflow.add_node("coach", coach_agent)
    
    workflow.set_entry_point("coach")
    workflow.add_edge("coach", END)
    
    return workflow


# Compile graphs with memory checkpointing
memory = MemorySaver()

# Main job discovery workflow
main_graph = create_agent_graph()
main_app = main_graph.compile(checkpointer=memory)

# Interview preparation workflow
interview_graph = create_interview_graph()
interview_app = interview_graph.compile(checkpointer=memory)


async def run_agent_workflow(
    user_id: str,
    user_profile: dict | None = None,
    thread_id: str | None = None,
) -> AgentState:
    """
    Run the main agent workflow for a user.
    
    Args:
        user_id: The user's ID
        user_profile: Optional pre-loaded user profile
        thread_id: Optional thread ID for checkpointing
    
    Returns:
        Final AgentState with all results
    """
    from state.schemas import UserProfile
    
    # Initialize state
    initial_state = AgentState(
        user_id=user_id,
        user_profile=UserProfile(**user_profile) if user_profile else None,
    )
    
    # Run the workflow
    config = {"configurable": {"thread_id": thread_id or user_id}}
    
    final_state = None
    async for event in main_app.astream(initial_state, config):
        # event contains the updated state from each node
        for node_name, node_state in event.items():
            if isinstance(node_state, AgentState):
                final_state = node_state
    
    return final_state


async def run_interview_prep(
    user_id: str,
    job_id: str | None = None,
    company_name: str | None = None,
    mode: str = "behavioral",
    thread_id: str | None = None,
) -> AgentState:
    """
    Run the interview preparation workflow.
    
    Args:
        user_id: The user's ID
        job_id: Optional specific job to prepare for
        company_name: Company name for targeted prep
        mode: Interview mode (oa, code, behavioral)
        thread_id: Optional thread ID for checkpointing
    
    Returns:
        Final AgentState with interview session results
    """
    from state.schemas import InterviewSession, InterviewMode
    
    # Initialize state with interview context
    initial_state = AgentState(
        user_id=user_id,
        interview_sessions=[
            InterviewSession(
                id=f"session-{user_id}-{job_id or 'general'}",
                user_id=user_id,
                job_id=job_id,
                mode=InterviewMode(mode),
                company_name=company_name,
            )
        ],
    )
    
    # Run the workflow
    config = {"configurable": {"thread_id": thread_id or f"interview-{user_id}"}}
    
    final_state = None
    async for event in interview_app.astream(initial_state, config):
        for node_name, node_state in event.items():
            if isinstance(node_state, AgentState):
                final_state = node_state
    
    return final_state
