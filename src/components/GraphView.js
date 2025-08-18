import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

function AdvancedGraphView({ files, currentFile, onNodeClick, onCreateNote, onDeleteNote }) {
  const svgRef = useRef();
  const [selectedNode, setSelectedNode] = useState(null);
  const [forceStrength, setForceStrength] = useState(-300);
  const [linkDistance, setLinkDistance] = useState(100);
  const [colorMode, setColorMode] = useState('cluster');
  const [showOrphans, setShowOrphans] = useState(true);
  const [draggedNode, setDraggedNode] = useState(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const [contextMenuNode, setContextMenuNode] = useState(null);

  useEffect(() => {
    if (!files.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 1000;
    const height = 700;

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const nodes = files.map(file => {
      const linkCount = files.reduce((count, f) => {
        if (f.content) {
          const wikiLinks = f.content.match(/\[\[([^\]]+)\]\]/g) || [];
          return count + wikiLinks.filter(link => link.slice(2, -2) === file.name).length;
        }
        return count;
      }, 0);

      return {
        id: file.name,
        path: file.path,
        linkCount,
        size: Math.max(8, Math.min(20, linkCount * 3 + 8)),
        cluster: linkCount > 5 ? 'hub' : linkCount > 2 ? 'connector' : 'leaf',
        isCurrent: currentFile === file.path
      };
    });

    const links = [];
    files.forEach(file => {
      if (file.content) {
        const wikiLinks = file.content.match(/\[\[([^\]]+)\]\]/g) || [];
        wikiLinks.forEach(link => {
          const targetName = link.slice(2, -2);
          const targetFile = files.find(f => f.name === targetName);
          if (targetFile) {
            links.push({
              source: file.name,
              target: targetFile.name,
              strength: 1
            });
          }
        });
      }
    });

    const filteredNodes = showOrphans ? nodes : nodes.filter(n => 
      links.some(l => l.source === n.id || l.target === n.id)
    );

    const simulation = d3.forceSimulation(filteredNodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(linkDistance))
      .force('charge', d3.forceManyBody().strength(linkStrength))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => d.size + 5));

    const defs = svg.append('defs');
    const gradient = defs.append('radialGradient')
      .attr('id', 'nodeGradient')
      .attr('cx', '30%')
      .attr('cy', '30%');
    
    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#ffffff')
      .attr('stop-opacity', 0.8);
    
    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#4a90e2')
      .attr('stop-opacity', 1);

    const linkGroup = svg.append('g').attr('class', 'links');
    const nodeGroup = svg.append('g').attr('class', 'nodes');
    const labelGroup = svg.append('g').attr('class', 'labels');

    const link = linkGroup.selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#555')
      .attr('stroke-width', d => Math.sqrt(d.strength) * 2)
      .attr('stroke-opacity', 0.6)
      .style('filter', 'drop-shadow(0 0 3px rgba(74, 144, 226, 0.3))');

    const getNodeColor = (d) => {
      if (colorBy === 'cluster') {
        return d.cluster === 'hub' ? '#ff6b6b' : 
               d.cluster === 'connector' ? '#4ecdc4' : '#45b7d1';
      }
      return d.isCurrent ? '#ff9500' : '#4a90e2';
    };

    const node = nodeGroup.selectAll('circle')
      .data(filteredNodes)
      .join('circle')
      .attr('r', d => d.size)
      .attr('fill', getNodeColor)
      .attr('stroke', d => d.isCurrent ? '#ff9500' : '#fff')
      .attr('stroke-width', d => d.isCurrent ? 3 : 2)
      .style('cursor', 'pointer')
      .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    const label = labelGroup.selectAll('text')
      .data(filteredNodes)
      .join('text')
      .text(d => d.id.length > 15 ? d.id.substring(0, 15) + '...' : d.id)
      .attr('font-size', d => Math.max(10, d.size * 0.8))
      .attr('font-family', 'Inter, -apple-system, sans-serif')
      .attr('font-weight', d => d.isCurrent ? 'bold' : 'normal')
      .attr('fill', '#e0e0e0')
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.size + 15)
      .style('pointer-events', 'none')
      .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.7)');

    node
      .on('click', (event, d) => {
        setSelectedNode(d);
        onNodeClick(d.id);
      })
      .on('contextmenu', (event, d) => {
        event.preventDefault();
        setContextMenuNode(d);
        setContextMenuPos({ x: event.clientX, y: event.clientY });
        setShowContextMenu(true);
      })
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', d.size * 1.3)
          .style('filter', 'drop-shadow(0 0 10px rgba(56, 139, 253, 0.8))');
        
        // Show tooltip
        const tooltip = svg.append('g')
          .attr('class', 'tooltip')
          .attr('transform', `translate(${d.x + 20}, ${d.y - 10})`);
        
        tooltip.append('rect')
          .attr('width', 120)
          .attr('height', 30)
          .attr('rx', 4)
          .style('fill', '#21262d')
          .style('stroke', '#30363d');
        
        tooltip.append('text')
          .attr('x', 10)
          .attr('y', 20)
          .style('fill', '#f0f6fc')
          .style('font-size', '12px')
          .text(d.id.replace('.md', ''));
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', d.size)
          .style('filter', 'none');
        
        svg.selectAll('.tooltip').remove();
      });

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

      label
        .attr('x', d => d.x)
        .attr('y', d => d.y);
    });

    const drag = d3.drag()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
        setDraggedNode(d);
        d3.select(event.sourceEvent.target)
          .style('cursor', 'grabbing')
          .style('filter', 'drop-shadow(0 0 15px rgba(56, 139, 253, 1))');
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
        setDraggedNode(null);
        d3.select(event.sourceEvent.target)
          .style('cursor', 'pointer')
          .style('filter', 'none');
      });
    
    node.call(drag);

  }, [files, onNodeClick, currentFile, forceStrength, linkDistance, showOrphans, colorMode]);

  return (
    <div className="graph-view">
      <div className="graph-controls">
        <div className="graph-title">
          <h3>🕸️ Knowledge Graph</h3>
          <span className="node-count">{files.length} notes</span>
        </div>
        
        <div className="graph-settings">
          <div className="control-group">
            <label>Force Strength</label>
            <input
              type="range"
              min="-1000"
              max="-50"
              value={forceStrength}
              onChange={(e) => setForceStrength(Number(e.target.value))}
            />
          </div>
          
          <div className="control-group">
            <label>Link Distance</label>
            <input
              type="range"
              min="50"
              max="200"
              value={linkDistance}
              onChange={(e) => setLinkDistance(Number(e.target.value))}
            />
          </div>
          
          <div className="control-group">
            <label>Color by</label>
            <select value={colorMode} onChange={(e) => setColorMode(e.target.value)}>
              <option value="cluster">Cluster</option>
              <option value="current">Current File</option>
            </select>
          </div>
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showOrphans}
              onChange={(e) => setShowOrphans(e.target.checked)}
            />
            Show orphan notes
          </label>
        </div>
      </div>

      <div className="graph-container">
        <svg
          ref={svgRef}
          width="100%"
          height="700"
          className="graph-svg"
        />
        
        {selectedNode && (
          <div className="node-info">
            <h4>{selectedNode.id.replace('.md', '')}</h4>
            <p><strong>Type:</strong> {selectedNode.cluster}</p>
            <p><strong>Connections:</strong> {selectedNode.linkCount}</p>
            <p><strong>Size:</strong> {Math.round(selectedNode.size || selectedNode.linkCount * 5 + 10)}</p>
            <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexDirection: 'column' }}>
              <button 
                onClick={() => onNodeClick(selectedNode.id)}
                style={{
                  background: '#388bfd',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Open Note
              </button>
              <button 
                onClick={() => {
                  if (onDeleteNote) onDeleteNote(selectedNode.id);
                  setSelectedNode(null);
                }}
                style={{
                  background: '#da3633',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Delete Note
              </button>
            </div>
          </div>
        )}
        
        {showContextMenu && (
          <div 
            className="graph-context-menu"
            style={{
              position: 'fixed',
              left: contextMenuPos.x,
              top: contextMenuPos.y,
              background: '#21262d',
              border: '1px solid #30363d',
              borderRadius: '8px',
              padding: '8px 0',
              zIndex: 1000,
              minWidth: '180px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
              animation: 'slideInScale 0.15s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              className="context-menu-item"
              onClick={() => {
                onNodeClick(contextMenuNode.id);
                setShowContextMenu(false);
              }}
            >
              📖 Open Note
            </div>
            <div 
              className="context-menu-item"
              onClick={() => {
                if (onCreateNote) {
                  const newNoteName = `Connected to ${contextMenuNode.id.replace('.md', '')}`;
                  onCreateNote(newNoteName);
                }
                setShowContextMenu(false);
              }}
            >
              ➕ Create Connected Note
            </div>
            <div className="context-menu-divider"></div>
            <div 
              className="context-menu-item danger"
              onClick={() => {
                if (onDeleteNote) onDeleteNote(contextMenuNode.id);
                setShowContextMenu(false);
                setSelectedNode(null);
              }}
            >
              🗑️ Delete Note
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GraphView;
