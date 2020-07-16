const d3 = require('d3');

class OrgTree {
    constructor() {
        this.defaults = {
            svgWidth: 800,
            svgHeight: 600,
        };

        // exported variables
        const attrs = {
            id: `ID${Math.floor(Math.random() * 1000000)}`, // Id for event handlings
            svgWidth: 0,
            svgHeight: 0,
            marginTop: 0,
            marginBottom: 0,
            marginRight: 0,
            marginLeft: 0,
            container: 'body',
            defaultTextFill: '#2C3E50',
            nodeTextFill: 'white',
            defaultFont: 'Helvetica',
            backgroundColor: '#fafafa',
            data: null,
            highlight: {
                "borderWidth": 1,
                "borderRadius": 15,
                "borderColor": {
                    "red": 50,
                    "green": 255,
                    "blue": 30,
                    "alpha": 1
                },
                "backgroundColor": {
                    "red": 20,
                    "green": 100,
                    "blue": 40,
                    "alpha": 1
                }
            },
            current: null,
            depth: 180,
            duration: 600,
            strokeWidth: 3,
            initialZoom: 1,
            orientation: 'right-to-left',
            onNodeClick: d => d,
            onNodeAdd: d => d,
            onNodeRemove: d => d,
        };

        this.getChartState = () => attrs;

        //(x,y) for the node position
        //(x1,y1) for the add btn position
        //(x2,y3) for the remove btn position
        this.orientations = {
            "top-to-bottom": {
                size: [attrs.svgWidth, attrs.svgHeight],
                x: function (d) {
                    return d.x;
                },
                y: function (d) {
                    return d.y;
                },
                x1: function (d) {
                    return 0
                },
                y1: function (d) {
                    return d.height / 2
                },
                x2: function (d) {
                    return d.width / 2
                },
                y2: function (d) {
                    return 0
                }
            },
            "bottom-to-top": {
                size: [attrs.svgWidth, attrs.svgHeight],
                x: function (d) {
                    return d.x;
                },
                y: function (d) {
                    return attrs.svgHeight - d.y;
                },
                x1: function (d) {
                    return 0
                },
                y1: function (d) {
                    return -d.width / 4
                },
                x2: function (d) {
                    return d.width / 2
                },
                y2: function (d) {
                    return 0
                }
            },
            "right-to-left": {
                size: [attrs.svgHeight, attrs.svgWidth],
                x: function (d) {
                    return attrs.svgWidth - d.y;
                },
                y: function (d) {
                    return d.x;
                },
                x1: function (d) {
                    return -d.width / 2
                },
                y1: function (d) {
                    return 0
                },
                x2: function (d) {
                    return 0
                },
                y2: function (d) {
                    return d.height / 2
                }
            },
            "left-to-right": {
                size: [attrs.svgHeight, attrs.svgWidth],
                x: function (d) {
                    return d.y;
                },
                y: function (d) {
                    return d.x;
                },
                x1: function (d) {
                    return d.width / 2
                },
                y1: function (d) {
                    return 0
                },
                x2: function (d) {
                    return 0
                },
                y2: function (d) {
                    return d.height / 2
                }
            }
        }

        //make properties functional and chaining call
        Object.keys(attrs).forEach((key) => {
            this[key] = (args) => {
                ((_) => {
                    return attrs[key] = _
                })(args)
                return this
            };
        });

        this.initializeEnterExitUpdatePattern();
    }

    initializeEnterExitUpdatePattern() {
        d3.selection.prototype.patternify = function (params) {
            var container = this;
            var selector = params.selector;
            var elementTag = params.tag;
            var data = params.data || [selector];

            // Pattern in action
            var selection = container.selectAll('.' + selector).data(data, (d, i) => {
                if (typeof d === 'object') {
                    if (d.id) {
                        return d.id;
                    }
                }
                return i;
            });
            selection.exit().remove();
            selection = selection.enter().append(elementTag).merge(selection);
            selection.attr('class', selector);
            return selection;
        };
    }

    getNodeChildrenIds({data, children, _children}, nodeIdsStore) {

        // Store current node ID
        nodeIdsStore.push(data.nodeId);

        // Loop over children and recursively store descendants id (expanded nodes)
        if (children) {
            children.forEach(d => {
                this.getNodeChildrenIds(d, nodeIdsStore)
            })
        }

        // Loop over _children and recursively store descendants id (collapsed nodes)
        if (_children) {
            _children.forEach(d => {
                this.getNodeChildrenIds(d, nodeIdsStore)
            })
        }

        // Return result
        return nodeIdsStore;
    }

    setZoomFactor(zoomLevel) {
        const attrs = this.getChartState();
        const calc = attrs.calc;

        // Store passed zoom level
        attrs.initialZoom = zoomLevel;

        // Rescale container element accordingly
        attrs.centerG.attr('transform', ` translate(${calc.nodeMaxWidth}, ${calc.centerY}) scale(${attrs.initialZoom})`)
    }

    render() {
        const attrs = this.getChartState();
        const thisObjRef = this;

        //Drawing containers
        const container = d3.select(attrs.container);
        const containerRect = container.node().getBoundingClientRect();
        if (!attrs.svgWidth) {
            attrs.svgWidth = containerRect.width || this.defaults.svgWidth
        }
        if (!attrs.svgHeight) {
            attrs.svgHeight = containerRect.height || this.defaults.svgHeight
        }

        //Calculated properties
        const calc = {
            id: null,
            chartWidth: null,
            chartHeight: null
        };
        calc.id = `ID${Math.floor(Math.random() * 1000000)}`; // id for event handlings

        calc.chartWidth = attrs.svgWidth - attrs.marginLeft - attrs.marginRight;
        calc.chartHeight = attrs.svgHeight - attrs.marginTop - attrs.marginBottom;

        attrs.calc = calc;

        // Get maximum node width and height
        calc.nodeMaxWidth = d3.max(attrs.data, ({width}) => width);
        calc.nodeMaxHeight = d3.max(attrs.data, ({height}) => height);

        // Calculate max node depth (it's needed for layout heights calculation)
        attrs.depth = ['top-to-bottom', 'bottom-to-top'].includes(attrs.orientation) > 0 ? (calc.nodeMaxHeight + 100) : (calc.nodeMaxWidth + 100);
        calc.centerX = calc.chartWidth / 2;
        calc.centerY = calc.chartHeight / 2;

        //********************  LAYOUTS  ***********************
        const layouts = {
            treemap: null
        }
        attrs.layouts = layouts;

        // Generate tree layout function
        layouts.treemap = d3.tree().size([calc.chartWidth, calc.chartHeight])
            .nodeSize([calc.nodeMaxWidth + 100, calc.nodeMaxHeight])

        // ******************* BEHAVIORS . **********************
        const behaviors = {zoom: null}

        // Get zooming function
        behaviors.zoom = d3.zoom()
            .scaleExtent([0.4, 4])
            .on('zoom', () => {
                d3.select('.chart').attr('transform', d3.event.transform);
                // Apply new styles to the foreign object element
                if (this.isEdge()) {
                    this.restyleForeignObjectElements();
                }
            });

        //****************** ROOT node work ************************

        // Convert flat data to hierarchical
        attrs.root = d3.stratify()
            .id(({nodeId}) => nodeId)
            .parentId(({parentNodeId}) => parentNodeId)(attrs.data)

        // Set child nodes enter appearance positions
        attrs.root.x0 = 0;
        attrs.root.y0 = 0;

        /** Get all nodes as array (with extended parent & children properties set)
         This way we can access any node's parent directly using node.parent - pretty cool, huh?
         */
        attrs.allNodes = attrs.layouts.treemap(attrs.root).descendants()

        // Assign direct children and total subordinate children's cound
        attrs.allNodes.forEach(d => {
            Object.assign(d.data, {
                directSubordinates: d.children ? d.children.length : 0,
                totalSubordinates: d.descendants().length - 1
            })
        })

        // Collapse all children at first
        attrs.root.children.forEach(d => this.collapse(d));

        // Then expand some nodes, which have `expanded` property set
        attrs.root.children.forEach(d => this.expandSomeNodes(d));

        // *************************  DRAWING **************************
        //Add svg
        const svg = container
            .patternify({
                tag: 'svg',
                selector: 'svg-chart-container'
            })
            .attr('width', attrs.svgWidth)
            .attr('height', attrs.svgHeight)
            .attr('font-family', attrs.defaultFont)
            .call(behaviors.zoom)
            .attr('cursor', 'move')
            .style('background-color', attrs.backgroundColor);

        attrs.svg = svg;

        //Add container g element
        const chart = svg
            .patternify({
                tag: 'g',
                selector: 'chart'
            })
            .attr('transform', `translate(${attrs.marginLeft},${attrs.marginTop})`);

        // Add one more container g element, for better positioning controls
        attrs.centerG = chart.patternify({
            tag: 'g',
            selector: 'center-group'
        })
            .attr('transform', `translate(${calc.centerX},${calc.centerY}) scale(${attrs.initialZoom})`);

        attrs.chart = chart;

        // Display tree contenrs
        this.update(attrs.root)

        //#########################################  UTIL FUNCS ##################################
        // This function restyles foreign object elements ()

        d3.select(window).on(`resize.${attrs.id}`, () => {
            const containerRect = container.node().getBoundingClientRect();
            //  if (containerRect.width > 0) attrs.svgWidth = containerRect.width;
            //	main();
        });

        return this;
    }

    update({x0, y0, x, y}) {
        const attrs = this.getChartState();
        const calc = attrs.calc;

        //  Assigns the x and y position for the nodes
        const treeData = attrs.layouts.treemap(attrs.root);

        // Get tree nodes and links and attach some properties
        const nodes = treeData.descendants()
            .map(d => {
                // If at least one property is already set, then we don't want to reset other properties
                if (d.width) return d;

                // Declare properties with default values
                let imageWidth = 100;
                let imageHeight = 100;
                let imageBorderColor = 'steelblue';
                let imageBorderWidth = 0;
                let imageRx = 0;
                let imageCenterTopDistance = 0;
                let imageCenterLeftDistance = 0;
                let borderColor = 'steelblue';
                let backgroundColor = 'steelblue';
                let width = d.data.width;
                let height = d.data.height;

                // Override default values based on data
                if (d.data.borderColor) {
                    borderColor = this.rgbaObjToColor(d.data.borderColor);
                }
                if (d.data.backgroundColor) {
                    backgroundColor = this.rgbaObjToColor(d.data.backgroundColor);
                }

                // Extend node object with calculated properties
                return Object.assign(d, {
                    imageWidth,
                    imageHeight,
                    imageBorderColor,
                    imageBorderWidth,
                    borderColor,
                    backgroundColor,
                    imageRx,
                    width,
                    height,
                    imageCenterTopDistance,
                    imageCenterLeftDistance,
                });
            });

        // Get all links
        const links = treeData.descendants().slice(1);

        // Set constant depth for each nodes
        nodes.forEach(d => {
            d.y = d.depth * attrs.depth
        });

        // --------------------------  LINKS ----------------------
        // Get links selection
        const linkSelection = attrs.centerG.selectAll('path.link')
            .data(links, ({id}) => id);

        // Enter any new links at the parent's previous position.
        const linkEnter = linkSelection.enter()
            .insert('path', "g")
            .attr("class", "link")
            .attr('d', d => {
                const o = {
                    x: x0,
                    y: y0
                };
                return this.diagonal(o, o)
            });

        // Get links update selection
        const linkUpdate = linkEnter.merge(linkSelection);

        // Styling links
        linkUpdate
            .attr("fill", "none")
            .attr("stroke-width", ({data}) => data.connectorLineWidth || 2)
            .attr('stroke', ({data}) => {
                if (data.connectorLineColor) {
                    return this.rgbaObjToColor(data.connectorLineColor);
                }
                return 'green';
            })
            .attr('stroke-dasharray', ({data}) => {
                if (data.dashArray) {
                    return data.dashArray;
                }
                return '';
            })

        // Transition back to the parent element position
        linkUpdate.transition()
            .duration(attrs.duration)
            .attr('d', d => this.diagonal(d, d.parent));

        // Remove any  links which is exiting after animation
        const linkExit = linkSelection.exit().transition()
            .duration(attrs.duration)
            .attr('d', d => {
                const o = {
                    x: x,
                    y: y
                };
                return this.diagonal(o, o)
            })
            .remove();

        // --------------------------  NODES ----------------------
        // Get nodes selection
        const nodesSelection = attrs.centerG.selectAll('g.node')
            .data(nodes, ({id}) => id)

        // Enter any new nodes at the parent's previous position.
        const nodeEnter = nodesSelection.enter().append('g')
            .attr('class', d => {
                return attrs.current === d.id ? 'node current' : 'node'
            })
            .attr('id', d => d.id)
            .attr("transform", d => `translate(${x0},${y0})`)
            .attr('cursor', 'pointer')
            .on('click', ({data}) => {
                if ([...d3.event.srcElement.classList].includes('node-expand-button-circle') || [...d3.event.srcElement.classList].includes('node-add-button-circle') || [...d3.event.srcElement.classList].includes('node-remove-button-circle')) {
                    return;
                }
                attrs.current = data.nodeId

                //remove the previous current node style
                d3.selectAll('g.node.current > .node-rect')
                    .attr('stroke-width', ({data}) => data.borderWidth || attrs.strokeWidth)
                    .attr('stroke', ({borderColor}) => borderColor)
                    .style("fill", ({backgroundColor}) => backgroundColor)
                d3.selectAll('g.node.current').node().classList.remove("current")

                //add the target node current style
                d3.select('#' + data.nodeId).node().classList.add("current")
                d3.select('#' + data.nodeId + ' > .node-rect')
                    .attr('stroke-width', attrs['highlight']['borderWidth'] || attrs['highlight']['strokeWidth'])
                    .attr('stroke', this.rgbaObjToColor(attrs['highlight']['borderColor']))
                    .style("fill", this.rgbaObjToColor(attrs['highlight']['backgroundColor']))
                attrs.onNodeClick(data.nodeId);
            });

        // Add background rectangle for the nodes
        nodeEnter
            .patternify({tag: 'rect', selector: 'node-rect', data: d => [d]})

        // Node update styles
        const nodeUpdate = nodeEnter.merge(nodesSelection)
            .style('font', '12px sans-serif');

        // Add foreignObject element inside rectangle
        const fo = nodeUpdate
            .patternify({
                tag: 'foreignObject', selector: 'node-foreign-object', data: d => [d]
            })

        // Add foreign object
        fo.patternify({
            tag: 'xhtml:div', selector: 'node-foreign-object-div', data: d => [d]
        })

        this.restyleForeignObjectElements();

        const nodeExpandButtonGroups = nodeEnter
            .patternify({
                tag: 'g', selector: 'node-expand-button-g', data: d => [d]
            })
            .on('click', d => this.onButtonClick(d))
        nodeExpandButtonGroups
            .patternify({
                tag: 'circle', selector: 'node-expand-button-circle', data: d => [d]
            })
        nodeExpandButtonGroups
            .patternify({
                tag: 'text', selector: 'node-expand-button-text', data: d => [d]
            })
            .attr('pointer-events', 'none')


        const nodeAddButtonGroups = nodeEnter
            .patternify({
                tag: 'g', selector: 'node-add-button-g', data: d => [d]
            })
            .on('click', d => {
                attrs.onNodeAdd(d.id);
            })
        nodeAddButtonGroups
            .patternify({
                tag: 'circle', selector: 'node-add-button-circle', data: d => [d]
            })
        nodeAddButtonGroups
            .patternify({
                tag: 'text', selector: 'node-add-button-text', data: d => [d]
            })
            .attr('pointer-events', 'none')


        const nodeRemoveButtonGroups = nodeEnter
            .patternify({
                tag: 'g', selector: 'node-remove-button-g', data: d => [d]
            })
            .on('click', d => {
                attrs.onNodeRemove(d.id);
            })
        nodeRemoveButtonGroups
            .patternify({
                tag: 'circle', selector: 'node-remove-button-circle', data: d => [d]
            })
        nodeRemoveButtonGroups
            .patternify({
                tag: 'text', selector: 'node-remove-button-text', data: d => [d]
            })
            .attr('pointer-events', 'none')


        // Transition to the proper position for the node
        nodeUpdate.transition()
            .attr('opacity', 0)
            .duration(attrs.duration)
            .attr("transform", (d) => `translate(${this.orientations[attrs.orientation].x(d)},${this.orientations[attrs.orientation].y(d)})`)
            .attr('opacity', 1)

        // Style node rectangles
        nodeUpdate.select('.node-rect')
            .attr('width', ({data}) => data.width)
            .attr('height', ({data}) => data.height)
            .attr('x', ({data}) => -data.width / 2)
            .attr('y', ({data}) => -data.height / 2)
            .attr('rx', ({data}) => data.borderRadius || 0)
            .attr('cursor', 'pointer')
            //can define highlight style
            .attr('stroke-width', ({data}) =>
                data.nodeId === attrs.current ? (attrs['highlight']['borderWidth'] || attrs['highlight']['strokeWidth']) : (data.borderWidth || attrs.strokeWidth)
            )
            .attr('stroke', ({data, borderColor}) => data.nodeId === attrs.current ? this.rgbaObjToColor(attrs['highlight']['borderColor']) : borderColor)
            .style("fill", ({data, backgroundColor}) => data.nodeId === attrs.current ? this.rgbaObjToColor(attrs['highlight']['backgroundColor']) : backgroundColor)

        /*// Move node button group to the desired position
        nodeUpdate.select('.node-expand-button-g')
            .attr('transform', ({data}) => `translate(${-data.width / 2},0)`)
            .attr('opacity', ({children, _children}) => {
                if (children || _children) {
                    return 1;
                }
                return 0;
            })
        nodeUpdate.select('.node-expand-button-circle')
            .attr('r', 16)
            .attr('stroke-width', ({data}) => data.borderWidth || attrs.strokeWidth)
            .attr('fill', attrs.backgroundColor)
            .attr('stroke', ({borderColor}) => borderColor)
        nodeUpdate.select('.node-expand-button-text')
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'middle')
            .attr('fill', attrs.defaultTextFill)
            .attr('font-size', ({children}) => {
                if (children) return 40;
                return 26;
            })
            .text(({children}) => {
                if (children) return '-';
                return '+';
            })
            .attr('y', this.isEdge() ? 10 : 0)*/


        // Move node button group to the desired position
        nodeUpdate.select('.node-add-button-g')
            .attr('transform', ({data}) => 'translate(' + this.orientations[attrs.orientation].x1(data) + ',' + this.orientations[attrs.orientation].y1(data) + ')')
            .attr('display', ({data}) => {
                if (data.added) {
                    return "block";
                }
                return "none";
            })
        nodeUpdate.select('.node-add-button-circle')
            .attr('r', 16)
            .attr('stroke-width', ({data}) => data.borderWidth || attrs.strokeWidth)
            .attr('fill', attrs.backgroundColor)
            .attr('stroke', ({borderColor}) => borderColor)
        nodeUpdate.select('.node-add-button-text')
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'middle')
            .attr('fill', attrs.defaultTextFill)
            .attr('font-size', ({children}) => {
                if (children) return 40;
                return 26;
            })
            .text(({children}) => {
                return '+';
            })
            .attr('y', this.isEdge() ? 10 : 0)


        // Move node button group to the desired position
        nodeUpdate.select('.node-remove-button-g')
            .attr('transform', ({data}) => 'translate(' + this.orientations[attrs.orientation].x2(data) + ',' + this.orientations[attrs.orientation].y2(data) + ')')
            .attr('display', ({data}) => {
                if (data.removed) {
                    return "block";
                }
                return "none";
            })
        nodeUpdate.select('.node-remove-button-circle')
            .attr('r', 16)
            .attr('stroke-width', ({data}) => data.borderWidth || attrs.strokeWidth)
            .attr('fill', attrs.backgroundColor)
            .attr('stroke', ({borderColor}) => borderColor)
        nodeUpdate.select('.node-remove-button-text')
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'middle')
            .attr('fill', attrs.defaultTextFill)
            .attr('font-size', ({children}) => {
                if (children) return 40;
                return 26;
            })
            .text(({children}) => {
                return '-';
            })
            .attr('y', this.isEdge() ? 10 : 0)

        // Remove any exiting nodes after transition
        const nodeExitTransition = nodesSelection.exit()
            .attr('opacity', 1)
            .transition()
            .duration(attrs.duration)
            .attr("transform", d => `translate(${x},${y})`)
            .on('end', function () {
                d3.select(this).remove();
            })
            .attr('opacity', 0);

        // On exit reduce the node rects size to 0
        nodeExitTransition.selectAll('.node-rect')
            .attr('width', 10)
            .attr('height', 10)
            .attr('x', 0)
            .attr('y', 0);

        // Store the old positions for transition.
        nodes.forEach(d => {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }


    addNode(obj) {
        const attrs = this.getChartState();
        attrs.data.push(obj);

        // Update state of nodes and redraw graph
        this.updateNodesState();
        return this;
    }

    removeNode(nodeId) {
        const attrs = this.getChartState();
        const node = attrs.allNodes.filter(({data}) => data.nodeId == nodeId)[0];

        // Remove all node childs
        if (node) {
            // Retrieve all children nodes ids (including current node itself)
            const nodeChildrenIds = this.getNodeChildrenIds(node, []);

            // Filter out retrieved nodes and reassign data
            attrs.data = attrs.data.filter(d => !nodeChildrenIds.includes(d.nodeId))

            const updateNodesState = this.updateNodesState.bind(this);
            // Update state of nodes and redraw graph
            updateNodesState();
        }
    }

    transformLayout(orientation) {
        console.log(orientation)
        const attrs = this.getChartState();
        attrs.orientation = orientation
        this.update(attrs.root)
    }

    isEdge() {
        return window.navigator.userAgent.includes("Edge");
    }

    rgbaObjToColor({red, green, blue, alpha}) {
        return `rgba(${red},${green},${blue},${alpha})`;
    }

    diagonal(s, t) {
        const attrs = this.getChartState();
        const calc = attrs.calc;
        const path = `M ${this.orientations[attrs.orientation].x(s)} ${this.orientations[attrs.orientation].y(s)}
            C ${this.orientations[attrs.orientation].x(s)} ${this.orientations[attrs.orientation].y(s)},
              ${this.orientations[attrs.orientation].x(s)} ${this.orientations[attrs.orientation].y(s)},
              ${this.orientations[attrs.orientation].x(t)} ${this.orientations[attrs.orientation].y(t)}`
        return path
    }

    restyleForeignObjectElements() {
        const attrs = this.getChartState();

        attrs.svg.selectAll('.node-foreign-object')
            .attr('width', ({width}) => width)
            .attr('height', ({height}) => height)
            .attr('x', ({width}) => -width / 2)
            .attr('y', ({height}) => -height / 2)
        attrs.svg.selectAll('.node-foreign-object-div')
            .style('width', ({width}) => `${width}px`)
            .style('height', ({height}) => `${height}px`)
            .style('color', 'white')
            .html(({data}) => data.template)
    }

    onButtonClick(d) {
        // If childrens are expanded
        if (d.children) {

            //Collapse them
            d._children = d.children;
            d.children = null;

            // Set descendants expanded property to false
            this.setExpansionFlagToChildren(d, false);
        } else {

            // Expand children
            d.children = d._children;
            d._children = null;

            // Set each children as expanded
            d.children.forEach(({data}) => data.expanded = true)
        }

        // Redraw Graph 
        this.update(d);
    }

    setExpansionFlagToChildren({data, children, _children}, flag) {

        // Set flag to the current property
        data.expanded = flag;

        // Loop over and recursively update expanded children's descendants
        if (children) {
            children.forEach(d => {
                this.setExpansionFlagToChildren(d, flag)
            })
        }

        // Loop over and recursively update collapsed children's descendants
        if (_children) {
            _children.forEach(d => {
                this.setExpansionFlagToChildren(d, flag)
            })
        }
    }

    setExpanded(id, expandedFlag) {
        const attrs = this.getChartState();
        // Retrieve node by node Id
        const node = attrs.allNodes.filter(({data}) => data.nodeId == id)[0]

        // If node exists, set expansion flag
        if (node) node.data.expanded = expandedFlag;

        // First expand all nodes
        attrs.root.children.forEach(d => this.expand(d));

        // Then collapse all nodes
        attrs.root.children.forEach(d => this.collapse(d));

        // Then expand only the nodes, which were previously expanded, or have an expand flag set
        attrs.root.children.forEach(d => this.expandSomeNodes(d));

        // Redraw graph
        this.update(attrs.root);
    }

    expandSomeNodes(d) {
        // If node has expanded property set
        if (d.data.expanded) {

            // Retrieve node's parent
            let parent = d.parent;

            // While we can go up 
            while (parent) {

                // Expand all current parent's children
                if (parent._children) {
                    parent.children = parent._children;
                }

                // Replace current parent holding object
                parent = parent.parent;
            }
        }

        // Recursivelly do the same for collapsed nodes
        if (d._children) {
            d._children.forEach(ch => this.expandSomeNodes(ch));
        }

        // Recursivelly do the same for expanded nodes 
        if (d.children) {
            d.children.forEach(ch => this.expandSomeNodes(ch));
        }
    }

    updateNodesState() {
        const attrs = this.getChartState();
        // Store new root by converting flat data to hierarchy
        attrs.root = d3.stratify()
            .id(({nodeId}) => nodeId)
            .parentId(({parentNodeId}) => parentNodeId)(attrs.data)

        // Store positions, where children appear during their enter animation
        attrs.root.x0 = 0;
        attrs.root.y0 = 0;

        // Store all nodes in flat format (although, now we can browse parent, see depth e.t.c. )
        attrs.allNodes = attrs.layouts.treemap(attrs.root).descendants()

        // Store direct and total descendants count
        attrs.allNodes.forEach(d => {
            Object.assign(d.data, {
                directSubordinates: d.children ? d.children.length : 0,
                totalSubordinates: d.descendants().length - 1
            })
        })

        // Expand all nodes first
        attrs.root.children && attrs.root.children.forEach(this.expand);

        // Then collapse them all
        attrs.root.children && attrs.root.children.forEach(d => this.collapse(d));

        // Then only expand nodes, which have expanded proprty set to true
        attrs.root.children && attrs.root.children.forEach(ch => this.expandSomeNodes(ch));

        // Redraw Graphs
        this.update(attrs.root)
    }

    collapse(d) {
        if (d.children) {
            d._children = d.children;
            d._children.forEach(ch => this.collapse(ch));
            d.children = null;
        }
    }

    expand(d) {
        if (d._children) {
            d.children = d._children;
            d.children.forEach(ch => this.expand(ch));
            d._children = null;
        }
    }

}


module.exports = OrgTree;
