import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';

function AdvancedGraphView({ files, currentFile, onNodeClick, onCreateNote, onDeleteNote }) {
  const svgRef = useRef();
  const containerRef = useRef();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, node: null });
  const [mode, setMode] = useState('force');
  const [graphSettings, setGraphSettings] = useState({
    linkDistance: 120,
    chargeStrength: -400,
    centerForce: 0.15,
    showLabels: true,
    nodeSize: 'connections',
    colorScheme: 'category',
    physics: true,
    clustering: true
  });

  useEffect(() => {
    if (files && files.length > 0) {
      const data = buildGraphData(files);
      setGraphData(data);
      if (mode === 'force') renderForceGraph(data);
      if (mode === 'timeline') renderTimeline(data);
      if (mode === 'tree') renderTree(data);
      if (mode === 'heatmap') renderHeatmap(data);
    } else {
      clearSvg();
    }
  }, [files, graphSettings, mode]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.graph-context-menu')) {
        setContextMenu({ show: false, x: 0, y: 0, node: null });
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const buildGraphData = useCallback((files) => {
    if (!files || !Array.isArray(files)) return { nodes: [], links: [] };
    
    const nodes = [];
    const links = [];
    const nodeMap = new Map();

    files.forEach(file => {
      if (!file || !file.name) return;
      
      const connections = extractConnections(file, files);
      const tags = extractTags(file.content || '');

      const node = {
        id: file.name,
        name: file.name,
        path: file.path || file.name,
        connections: connections.length,
        tags: tags,
        modified: file.modified || Date.now(),
        size: file.content ? file.content.length : 0,
        type: getNodeType(file),
        cluster: getCluster(file, tags)
      };
      
      nodes.push(node);
      nodeMap.set(node.id, node);
    });

    nodes.forEach(node => {
      const file = files.find(f => f.name === node.name);
      if (file && file.content) {
        const wikiLinks = file.content.match(/\[\[([^\]]+)\]\]/g) || [];
        wikiLinks.forEach(link => {
          const linkName = link.slice(2, -2);
          const targetFile = files.find(f => 
            f.name.includes(linkName) || 
            linkName.includes(f.name.replace('.md', ''))
          );
          if (targetFile && nodeMap.has(targetFile.name)) {
            links.push({
              source: node.id,
              target: targetFile.name,
              strength: calculateLinkStrength(file.content, linkName)
            });
          }
        });
      }
    });

    return { nodes, links };
  }, []);

  const extractConnections = (file, allFiles) => {
    if (!file.content) return [];
    const wikiLinks = file.content.match(/\[\[([^\]]+)\]\]/g) || [];
    return wikiLinks.map(link => link.slice(2, -2));
  };

  const extractTags = (content) => {
    const tagMatches = content.match(/#[\w-]+/g) || [];
    return tagMatches.map(tag => tag.slice(1));
  };

  const getNodeType = (file) => {
    if (file.name.toLowerCase().includes('index')) return 'hub';
    if (file.content && file.content.includes('TODO')) return 'task';
    if (file.content && file.content.includes('```')) return 'technical';
    return 'note';
  };

  const getCluster = (file, tags) => {
    if (tags.length > 0) return tags[0];
    if (file.path && file.path.includes('/')) return file.path.split('/')[0];
    return 'uncategorized';
  };

  const calculateLinkStrength = (content, linkName) => {
    const occurrences = (content.match(new RegExp(`\\[\\[${linkName}\\]\\]`, 'g')) || []).length;
    return Math.min(occurrences, 5);
  };

  const clearSvg = () => {
    if (!svgRef.current) return;
    d3.select(svgRef.current).selectAll('*').remove();
  };

  const renderForceGraph = useCallback((data) => {
    if (!svgRef.current || !containerRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const container = containerRef.current;
    const width = container.clientWidth || 1000;
    const height = container.clientHeight || 700;

    svg.attr('width', width).attr('height', height);

    if (!data.nodes || data.nodes.length === 0) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#7d8590')
        .attr('font-size', '18px')
        .text('No notes to display in graph view');
      return;
    }

    const colorScale = d3.scaleOrdinal()
      .domain(['hub', 'task', 'technical', 'note'])
      .range(['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4']);

    const maxConnections = d3.max(data.nodes, d => d.connections) || 1;
    const sizeScale = d3.scaleLinear()
      .domain([0, maxConnections])
      .range([12, 28]);

    const simulation = d3.forceSimulation(data.nodes)
      .force('link', d3.forceLink(data.links).id(d => d.id).distance(graphSettings.linkDistance))
      .force('charge', d3.forceManyBody().strength(graphSettings.chargeStrength))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(graphSettings.centerForce))
      .force('collision', d3.forceCollide().radius(d => sizeScale(d.connections || 0) + 8));

    const g = svg.append('g');

    const zoom = d3.zoom()
      .scaleExtent([0.2, 5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    const defs = svg.append('defs');
    const gradient = defs.append('radialGradient')
      .attr('id', 'nodeGradient')
      .attr('cx', '30%')
      .attr('cy', '30%');
    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#ffffff').attr('stop-opacity', 0.3);
    gradient.append('stop').attr('offset', '100%').attr('stop-color', '#000000').attr('stop-opacity', 0.1);

    const link = g.append('g')
      .selectAll('line')
      .data(data.links)
      .enter().append('line')
      .attr('stroke', '#30363d')
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', d => Math.sqrt(d.strength || 1) + 1)
      .style('filter', 'drop-shadow(0px 0px 3px rgba(56, 139, 253, 0.3))');

    const nodeGroup = g.append('g')
      .selectAll('g')
      .data(data.nodes)
      .enter().append('g')
      .style('cursor', 'pointer')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    const node = nodeGroup.append('circle')
      .attr('r', d => graphSettings.nodeSize === 'connections' ? sizeScale(d.connections || 0) : 15)
      .attr('fill', d => colorScale(d.type))
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 3)
      .style('filter', 'url(#nodeGradient) drop-shadow(0px 2px 8px rgba(0,0,0,0.3))')
      .on('click', handleNodeClick)
      .on('contextmenu', (event, d) => {
        event.preventDefault();
        setContextMenu({
          show: true,
          x: event.pageX,
          y: event.pageY,
          node: d
        });
      })
      .on('mouseover', (event, d) => {
        d3.select(event.target)
          .transition().duration(200)
          .attr('r', (graphSettings.nodeSize === 'connections' ? sizeScale(d.connections || 0) : 15) * 1.2)
          .style('filter', 'url(#nodeGradient) drop-shadow(0px 4px 12px rgba(56, 139, 253, 0.6))');
        showTooltip(event, d);
      })
      .on('mouseout', (event, d) => {
        d3.select(event.target)
          .transition().duration(200)
          .attr('r', graphSettings.nodeSize === 'connections' ? sizeScale(d.connections || 0) : 15)
          .style('filter', 'url(#nodeGradient) drop-shadow(0px 2px 8px rgba(0,0,0,0.3))');
        hideTooltip();
      });

    if (graphSettings.showLabels) {
      const label = nodeGroup.append('text')
        .text(d => d.name.replace('.md', ''))
        .attr('font-size', 11)
        .attr('fill', '#f0f6fc')
        .attr('text-anchor', 'middle')
        .attr('dy', d => (graphSettings.nodeSize === 'connections' ? sizeScale(d.connections || 0) : 15) + 18)
        .style('pointer-events', 'none')
        .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.8)')
        .style('font-weight', '500');

      simulation.on('tick', () => {
        link
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);

        nodeGroup
          .attr('transform', d => `translate(${d.x},${d.y})`);
      });
    } else {
      simulation.on('tick', () => {
        link
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);

        nodeGroup
          .attr('transform', d => `translate(${d.x},${d.y})`);
      });
    }

    function dragstarted(event, d) {
      if (!event.active && graphSettings.physics) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active && graphSettings.physics) simulation.alphaTarget(0);
      if (!event.sourceEvent.shiftKey) {
        d.fx = null;
        d.fy = null;
      }
    }

    function showTooltip(event, d) {
      d3.selectAll('.graph-tooltip').remove();
      
      const tooltip = d3.select('body').append('div')
        .attr('class', 'graph-tooltip')
        .style('position', 'absolute')
        .style('background', 'rgba(13, 17, 23, 0.95)')
        .style('border', '1px solid #30363d')
        .style('border-radius', '8px')
        .style('padding', '12px')
        .style('color', '#f0f6fc')
        .style('font-size', '13px')
        .style('backdrop-filter', 'blur(10px)')
        .style('box-shadow', '0 8px 32px rgba(0,0,0,0.4)')
        .style('z-index', '1000')
        .style('pointer-events', 'none')
        .style('opacity', 0);

      tooltip.transition()
        .duration(150)
        .style('opacity', 1);

      tooltip.html(`
        <div style="font-weight: 600; margin-bottom: 8px; color: #388bfd;">${d.name.replace('.md', '')}</div>
        <div style="margin-bottom: 4px;"><span style="color: #7d8590;">Connections:</span> ${d.connections}</div>
        <div style="margin-bottom: 4px;"><span style="color: #7d8590;">Type:</span> ${d.type}</div>
        <div style="margin-bottom: 4px;"><span style="color: #7d8590;">Tags:</span> ${d.tags.join(', ') || 'None'}</div>
        <div><span style="color: #7d8590;">Modified:</span> ${new Date(d.modified).toLocaleDateString()}</div>
      `)
        .style('left', (event.pageX + 15) + 'px')
        .style('top', (event.pageY - 10) + 'px');
    }

    function hideTooltip() {
      d3.selectAll('.graph-tooltip')
        .transition().duration(100)
        .style('opacity', 0)
        .remove();
    }
  }, [graphSettings, onNodeClick]);

  const renderTimeline = useCallback((data) => {
    if (!svgRef.current || !containerRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    const width = containerRef.current.clientWidth || 1000;
    const height = containerRef.current.clientHeight || 700;
    svg.attr('width', width).attr('height', height);
    if (!data.nodes.length) return;

    const x = d3.scaleTime()
      .domain(d3.extent(data.nodes, d => new Date(d.modified)))
      .range([60, width - 40]);
    const y = d3.scalePoint().domain(['Notes']).range([height/2, height/2]);

    const g = svg.append('g');
    g.append('g').attr('transform', `translate(0,${height/2})`).call(d3.axisBottom(x).ticks(6)).selectAll('text').attr('fill', '#8b949e');

    g.selectAll('circle').data(data.nodes)
      .enter().append('circle')
      .attr('cx', d => x(new Date(d.modified)))
      .attr('cy', y('Notes'))
      .attr('r', d => 4 + Math.min(12, (d.connections||0)))
      .attr('fill', '#58a6ff')
      .attr('opacity', 0.8)
      .on('click', (e,d) => onNodeClick && onNodeClick(d.name));
  }, [onNodeClick]);

  const renderTree = useCallback((data) => {
    if (!svgRef.current || !containerRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    const width = containerRef.current.clientWidth || 1000;
    const height = containerRef.current.clientHeight || 700;
    svg.attr('width', width).attr('height', height);
    if (!data.nodes.length) return;

    const root = { name: 'Vault', children: [] };
    const clusters = d3.group(data.nodes, d => d.cluster);
    clusters.forEach((vals, key) => {
      root.children.push({ name: key, children: vals.map(v => ({ name: v.name })) });
    });
    const hierarchy = d3.hierarchy(root);
    const treeLayout = d3.tree().size([height - 80, width - 160]);
    treeLayout(hierarchy);

    const g = svg.append('g').attr('transform', 'translate(80,40)');
    g.selectAll('path.link')
      .data(hierarchy.links())
      .enter().append('path')
      .attr('class', 'link')
      .attr('fill', 'none')
      .attr('stroke', '#30363d')
      .attr('d', d3.linkHorizontal().x(d => d.y).y(d => d.x));

    const node = g.selectAll('g.node')
      .data(hierarchy.descendants())
      .enter().append('g')
      .attr('transform', d => `translate(${d.y},${d.x})`);
    node.append('circle').attr('r', 4).attr('fill', '#58a6ff');
    node.append('text').text(d => d.data.name.replace?.('.md','') || d.data.name)
      .attr('dy', 4).attr('x', 8).attr('fill', '#c9d1d9').style('font-size', '12px');
  }, []);

  const renderHeatmap = useCallback((data) => {
    if (!svgRef.current || !containerRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    const width = containerRef.current.clientWidth || 1000;
    const height = containerRef.current.clientHeight || 700;
    svg.attr('width', width).attr('height', height);
    if (!data.nodes.length) return;

    const tagFreq = new Map();
    data.nodes.forEach(n => n.tags.forEach(t => tagFreq.set(t, (tagFreq.get(t)||0)+1)));
    const tags = Array.from(tagFreq.keys()).slice(0, 30);
    const notes = data.nodes;

    const cellSize = 18;
    const x = d3.scaleBand().domain(notes.map(n => n.name)).range([120, width-20]).padding(0.05);
    const y = d3.scaleBand().domain(tags).range([40, Math.min(height-20, 40 + tags.length * cellSize)]).padding(0.05);
    const color = d3.scaleSequential(d3.interpolateYlGnBu).domain([0, d3.max(tags, t => tagFreq.get(t)) || 1]);

    const g = svg.append('g');
    g.selectAll('rect')
      .data(tags.flatMap(t => notes.map(n => ({ t, n, v: n.tags.includes(t) ? 1 : 0 }))))
      .enter().append('rect')
      .attr('x', d => x(d.n.name))
      .attr('y', d => y(d.t))
      .attr('width', x.bandwidth())
      .attr('height', y.bandwidth())
      .attr('fill', d => d.v ? color(tagFreq.get(d.t)) : '#161b22')
      .attr('stroke', '#0d1117')
      .on('click', (e,d) => d.v && onNodeClick && onNodeClick(d.n.name));

    g.append('g').attr('transform', `translate(0,${y.range()[0]})`).call(d3.axisLeft(y)).selectAll('text').attr('fill', '#8b949e');
    g.append('g').attr('transform', `translate(0,${y.range()[1]}) rotate(-90)`).style('display','none');
  }, [onNodeClick]);

  const [connectingMode, setConnectingMode] = useState(false);
  const [sourceNode, setSourceNode] = useState(null);

  const handleContextAction = (action) => {
    const node = contextMenu.node;
    setContextMenu({ show: false, x: 0, y: 0, node: null });
    
    switch (action) {
      case 'open':
        if (onNodeClick) onNodeClick(node.name);
        break;
      case 'delete':
        if (onDeleteNote && window.confirm(`Delete "${node.name}"?`)) {
          onDeleteNote(node.path || node.name);
        }
        break;
      case 'connect':
        setConnectingMode(true);
        setSourceNode(node);
        break;
      case 'create-link':
        const targetName = prompt('Enter target note name:');
        if (targetName) {
          createConnection(node.name, targetName);
        }
        break;
    }
  };

  const createConnection = (sourceName, targetName) => {
    const newLink = {
      source: sourceName,
      target: targetName,
      type: 'manual'
    };
    
    setGraphData(prev => ({
      ...prev,
      links: [...prev.links, newLink]
    }));
  };

  const handleNodeClick = (event, d) => {
    event.stopPropagation();
    
    if (connectingMode && sourceNode) {
      if (d.id !== sourceNode.id) {
        createConnection(sourceNode.name, d.name);
      }
      setConnectingMode(false);
      setSourceNode(null);
    } else {
      setSelectedNode(d);
      if (onNodeClick) {
        onNodeClick(d.name);
      }
    }
  };

  return (
    <div className="graph-universe">
      <div className="universe-controls">
        <div className="universe-title">
          <h2>Knowledge Graph</h2>
        </div>
        
        <div className="universe-stats">
          <div className="stat-badge">{files?.length || 0} notes</div>
          <div className="stat-badge">{graphData.links?.length || 0} connections</div>
        </div>

        <div className="universe-settings">
          <div className="setting-group">
            <label>Mode</label>
            <select value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="force">Force</option>
              <option value="timeline">Timeline</option>
              <option value="tree">Tree</option>
              <option value="heatmap">Heatmap</option>
            </select>
          </div>
          <div className="setting-group">
            <label>Link Distance</label>
            <input
              type="range"
              min="60"
              max="250"
              value={graphSettings.linkDistance}
              onChange={(e) => setGraphSettings(prev => ({ ...prev, linkDistance: +e.target.value }))}
            />
            <span style={{color: '#7d8590', fontSize: '11px'}}>{graphSettings.linkDistance}px</span>
          </div>
          
          <div className="setting-group">
            <label>Gravity</label>
            <input
              type="range"
              min="-800"
              max="-100"
              value={graphSettings.chargeStrength}
              onChange={(e) => setGraphSettings(prev => ({ ...prev, chargeStrength: +e.target.value }))}
            />
            <span style={{color: '#7d8590', fontSize: '11px'}}>{Math.abs(graphSettings.chargeStrength)}</span>
          </div>
          
          <div className="setting-group">
            <label>Node Size</label>
            <select
              value={graphSettings.nodeSize}
              onChange={(e) => setGraphSettings(prev => ({ ...prev, nodeSize: e.target.value }))}
            >
              <option value="connections">By Connections</option>
              <option value="uniform">Uniform</option>
            </select>
          </div>
          
          <div className="setting-group">
            <label>View Mode</label>
            <select
              value={graphSettings.colorScheme}
              onChange={(e) => setGraphSettings(prev => ({ ...prev, colorScheme: e.target.value }))}
            >
              <option value="category">By Category</option>
              <option value="cluster">By Cluster</option>
            </select>
          </div>
        </div>

        <div className="universe-actions">
          <button 
            className={`universe-btn ${graphSettings.showLabels ? 'primary' : ''}`}
            onClick={() => setGraphSettings(prev => ({ ...prev, showLabels: !prev.showLabels }))}
          >
            {graphSettings.showLabels ? 'Labels On' : 'Labels Off'}
          </button>
          <button 
            className={`universe-btn ${graphSettings.physics ? 'primary' : ''}`}
            onClick={() => setGraphSettings(prev => ({ ...prev, physics: !prev.physics }))}
          >
            {graphSettings.physics ? 'Physics On' : 'Physics Off'}
          </button>
        </div>
      </div>

      <div className="graph-container" ref={containerRef} style={{width: '100%', height: '100vh'}}>
        <svg ref={svgRef}></svg>
      </div>

      {selectedNode && (
        <div className="node-details-panel">
          <div className="node-details-header">
            <h3>{selectedNode.name.replace('.md', '')}</h3>
            <button className="close-btn" onClick={() => setSelectedNode(null)}>×</button>
          </div>
          
          <div className="node-property">
            <span className="node-property-label">Connections</span>
            <span className="node-property-value">{selectedNode.connections}</span>
          </div>
          <div className="node-property">
            <span className="node-property-label">Type</span>
            <span className="node-property-value">{selectedNode.type}</span>
          </div>
          <div className="node-property">
            <span className="node-property-label">Tags</span>
            <span className="node-property-value">{selectedNode.tags.join(', ') || 'None'}</span>
          </div>
          <div className="node-property">
            <span className="node-property-label">Size</span>
            <span className="node-property-value">{selectedNode.size} chars</span>
          </div>
          <div className="node-property">
            <span className="node-property-label">Modified</span>
            <span className="node-property-value">{new Date(selectedNode.modified).toLocaleDateString()}</span>
          </div>
          
          <div className="node-actions">
            <button 
              className="node-action-btn primary"
              onClick={() => onNodeClick && onNodeClick(selectedNode.name)}
            >
              Open Note
            </button>
            <button 
              className="node-action-btn secondary"
              onClick={() => onCreateNote && onCreateNote(`Connected to ${selectedNode.name.replace('.md', '')}`)}
            >
              Create Connected
            </button>
            <button 
              className="node-action-btn danger"
              onClick={() => onDeleteNote && window.confirm(`Delete "${selectedNode.name}"?`) && onDeleteNote(selectedNode.name)}
            >
              Delete Note
            </button>
          </div>
        </div>
      )}

      {contextMenu.show && (
        <div 
          className="graph-context-menu"
          style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
            background: 'rgba(13, 17, 23, 0.95)',
            border: '1px solid #30363d',
            borderRadius: '8px',
            padding: '8px 0',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            zIndex: 1000,
            minWidth: '180px'
          }}
        >
          <div 
            className="context-menu-item"
            onClick={() => handleContextAction('open', contextMenu.node)}
          >
            Open Note
          </div>
          <div 
            className="context-menu-item"
            onClick={() => handleContextAction('create', contextMenu.node)}
          >
            Create Connected Note
          </div>
          <div className="context-menu-divider"></div>
          <div 
            className="context-menu-item danger"
            onClick={() => handleContextAction('delete', contextMenu.node)}
          >
            Delete Note
          </div>
        </div>
      )}
    </div>
  );
}

export default AdvancedGraphView;
