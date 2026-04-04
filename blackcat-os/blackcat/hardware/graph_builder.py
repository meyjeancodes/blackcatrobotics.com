"""Hardware graph construction from protocol map and component list."""

from __future__ import annotations

from collections import deque
from datetime import datetime, timezone

import networkx as nx

from blackcat.fingerprint.models import CANSignalClass, ProtocolMap
from blackcat.hardware.models import Component, ComponentType, Edge, HardwareGraph


def build_hardware_graph(
    platform_name: str,
    protocol_map: ProtocolMap,
    components: list[Component],
) -> HardwareGraph:
    """
    Build a directed hardware graph from components and protocol map.

    Nodes: components
    Edges: derived from CAN ID ranges (PDO, SDO, heartbeat topology)
    Computes failure propagation via BFS from each ACTUATOR node.
    """
    G = nx.DiGraph()
    edges: list[Edge] = []

    # Add all component nodes
    for comp in components:
        G.add_node(
            comp.id,
            name=comp.name,
            type=comp.type.value,
            specs=comp.specs,
            known_failure_modes=comp.known_failure_modes,
            can_ids=comp.can_ids,
        )

    # Find compute nodes (NMT master / main controller)
    compute_nodes = [c for c in components if c.type == ComponentType.COMPUTE]
    primary_compute = compute_nodes[0].id if compute_nodes else None

    # Build CAN-ID to component mapping
    can_id_to_comp: dict[int, str] = {}
    for comp in components:
        for can_id in comp.can_ids:
            can_id_to_comp[can_id] = comp.id

    # Derive edges from protocol map CAN signals
    for signal in protocol_map.can_signals:
        can_id = signal.can_id

        if signal.signal_class in (CANSignalClass.SENSOR, CANSignalClass.PDO):
            # PDO sensor → connect to compute node
            src = can_id_to_comp.get(can_id)
            if src and primary_compute and src != primary_compute:
                _add_edge(G, edges, src, primary_compute, "CAN_PDO")

        elif signal.signal_class == CANSignalClass.COMMAND:
            # PDO RX command → compute → actuator
            dst = can_id_to_comp.get(can_id)
            if dst and primary_compute and dst != primary_compute:
                _add_edge(G, edges, primary_compute, dst, "CAN_PDO")

        elif signal.signal_class == CANSignalClass.SDO:
            # SDO: connect compute to relevant node
            node_comp = can_id_to_comp.get(can_id)
            if node_comp and primary_compute and node_comp != primary_compute:
                _add_edge(G, edges, primary_compute, node_comp, "CAN_SDO")

        elif signal.signal_class == CANSignalClass.HEARTBEAT:
            # Heartbeat: node reports to NMT master (compute)
            hb_comp = can_id_to_comp.get(can_id)
            if hb_comp and primary_compute and hb_comp != primary_compute:
                _add_edge(G, edges, hb_comp, primary_compute, "CAN_NMT")

    # If no edges derived from signals (no can_id mapping), connect actuators/sensors to compute
    if not edges and primary_compute:
        for comp in components:
            if comp.id != primary_compute and comp.type in (
                ComponentType.ACTUATOR,
                ComponentType.SENSOR,
            ):
                protocol = "CAN" if comp.can_ids else "ROS2"
                _add_edge(G, edges, comp.id, primary_compute, protocol)

    # Failure propagation: BFS from each ACTUATOR to find downstream dependents
    failure_propagation: dict[str, list[str]] = {}
    for comp in components:
        if comp.type == ComponentType.ACTUATOR:
            downstream = _bfs_downstream(G, comp.id)
            failure_propagation[comp.id] = downstream

    # Convert graph to node-link JSON (networkx format)
    graph_json = nx.node_link_data(G)

    return HardwareGraph(
        platform_name=platform_name,
        components=components,
        edges=edges,
        graph_json=graph_json,
        failure_propagation=failure_propagation,
        generated_at=datetime.now(timezone.utc),
    )


def _add_edge(
    G: nx.DiGraph,
    edges: list[Edge],
    source: str,
    target: str,
    protocol: str,
) -> None:
    """Add an edge to the graph and edge list if not already present."""
    if not G.has_edge(source, target):
        G.add_edge(source, target, protocol=protocol)
        edges.append(Edge(source=source, target=target, protocol=protocol))


def _bfs_downstream(G: nx.DiGraph, start: str) -> list[str]:
    """BFS to find all nodes reachable from start (i.e., downstream dependents)."""
    visited: set[str] = set()
    queue: deque[str] = deque([start])

    while queue:
        node = queue.popleft()
        for neighbor in G.successors(node):
            if neighbor not in visited and neighbor != start:
                visited.add(neighbor)
                queue.append(neighbor)

    return list(visited)
