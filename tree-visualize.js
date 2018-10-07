let d3DataArray = [];


let margin = {
    top: 40,
    right: 120,
    bottom: 20,
    left: 120
};
let width = 960 - margin.right - margin.left;
let height = 500 - margin.top - margin.bottom;

let i = 0;

let tree = d3.layout.tree().size([height, width]);

let diagonal = d3.svg.diagonal()
    .projection(function (d) {
        return [d.x, d.y]
    });

let line = d3.svg.line().x(function (d) {
        return d.x
    })
    .y(function (d) {
        return d.y
    })
    .interpolate("linear");

let svg = d3.select("body").append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



function update(source) {

    // Compute the new tree layout.
    let nodes = tree.nodes(source).reverse();
    let links = tree.links(nodes);

    // add cross parent links
    let crossParentLinks = generatePartnerParentLinks(d3DataArray);
    links = crossParentLinks.concat(links);

    // add partner links
    let partnerLinks = generatePartnerLinks(d3DataArray);
    links = partnerLinks.concat(links);

    // Normalize for fixed-depth.
    nodes.forEach(function (d) {
        d.y = d.depth * 100;
    });

    // Declare the nodes…
    var node = svg.selectAll("g.node")
        .data(nodes, function (d) {
            return d.d3id || (d.d3id = ++i);
        });

    // Enter the nodes.
    var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        });

    nodeEnter.append("circle")
        .attr("r", 10)
        .style("fill", "#fff")
        .style("opacity", function (d) {
            if (!d.visible) {
                return 0;
            }
        });;

    nodeEnter.append("text")
        .attr("y", function (d) {
            return d.children || d._children ? -18 : 18;
        })
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .text(function (d) {
            return d.name;
        })
        .style("fill-opacity", 1)
        .style("opacity", function (d) {
            if (!d.visible) {
                return 0;
            }
        });



    // Declare the links…
    var link = svg.selectAll("path.link")
        .data(links);

    // Enter the links.
    link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("stroke", "blue")
        .attr("stroke-width", 0.5)
        .attr("fill", "none")
        .attr("d", function (d) {
            return line(createNodePath(d));
        })
        .style("opacity", function (d) {
            if (d.source.visible && d.target.visible) {
                if (!checkParent(d) && !checkPartner(d)) {
                    return 0;
                } else if (checkParent(d) || checkPartner(d)) {
                    return 1;
                }
            }
            return 0;

        });;

}


function generatePartnerParentLinks(dataArray) {
    let linkArray = [];
    dataArray.forEach(function (node) {
        if (node.parent.visible && (node.mother || node.father)) {
            if (node.mother != node.parent.id && node.father != node.parent.id) {
                let source = null;
                if (node.father) {
                    source = getObjectNodeById(dataArray, node.father);
                } else if (node.mother) {
                    source = getObjectNodeById(dataArray, node.mother);
                }

                let obj = {
                    "source": source,
                    "target": node
                };
                linkArray.push(obj);
            }
        }
    });

    return linkArray;
}


function generatePartnerLinks(dataArray) {
    let linkArray = [];

    dataArray.forEach(function (node) {
        if (!node.visited && node.partners.length > 0) {
            node.visited = true;

            node.partners.forEach(function (partner) {
                let partnerNode = getObjectNodeById(dataArray, partner);
                if (!partnerNode.visited) {
                    partnerNode.visited = true;
                    let obj = {
                        "source": node,
                        "target": partnerNode
                    };
                    linkArray.push(obj);
                }
            })
        }
    })

    return linkArray;
}


// create box link paths
function createNodePath(node) {

    let sourceHeight = node.source.y;
    let sourceWidth = node.source.x;
    let targetHeight = node.target.y;
    let targetWidth = node.target.x;

    if (checkParent(node)) {
        sourceWidth = _getMidPosition(node)
    }

    let heightMid = (sourceHeight + targetHeight) / 2;

    let pathArray = [{
            "x": sourceWidth,
            "y": sourceHeight
        },
        {
            "x": sourceWidth,
            "y": heightMid
        },
        {
            "x": targetWidth,
            "y": heightMid
        },
        {
            "x": targetWidth,
            "y": targetHeight
        }
    ];

    return pathArray;

}


// check the line is parent child line
function checkParent(link) {
    let isParent = false;

    let obj = _getChildnParent(link);

    if (obj.child.mother == obj.parent.id || obj.child.father == obj.parent.id) {
        isParent = true;
    }

    return isParent;
}


// select parent and child from given link
function _getChildnParent(link) {
    
    let child = link.target;
    let parent = link.source;
    if (link.target.depth < link.source.depth) {
        child = link.source;
        parent = link.target;
    }
    
    return {
        "child": child,
        "parent": parent
    }
}

// get mid position of partners
function _getMidPosition(link) {
    let obj = _getChildnParent(link);
    let parent = obj.parent;
    let child = obj.child;
    let position = 0;
    let x;
    
    if (parent.partners) {
        
        if (parent.partners.length > 0) {
            parent.partners.forEach(function (partner, index) {
                if (partner == child.mother || partner == child.father) {
                    position = index;
                }
            })
            
            let partner = getObjectNodeById(d3DataArray, parent.partners[position]);
            if (position == 0) {
                x = (parent.x + partner.x) / 2;
            } else {
                let prevPartner = getObjectNodeById(d3DataArray, parent.partners[position - 1]);
                x = (prevPartner.x + partner.x) / 2;
            }
        }else{
            x = parent.x;
        }
        
    }
    return x;
    
}


// check line is partner line
function checkPartner(link) {
    let partner = false;

    if (!link.source.visible || !link.target.visible)
        return partner;

    link.source.partners.forEach(node => {
        if (node == link.target.id) {
            partner = true;
        }
    });

    link.target.partners.forEach(node => {
        if (node == link.source.id) {
            partner = true;
        }
    });

    return partner;
}


// change position of nodes
function centerParentNodes(nodes){
    let maxGen = getMaxGeneration(nodes);
    let currentGenList = [];

    for(let i=maxGen; i>=0; i++){
        currentGenList = getNodesInGeneration(nodes,i);
        currentGenList = sortNodesInOrderOfPosition(currentGenList);

        currentGenList.forEach(function(node){
            let parent = node.parent;
            if(parent.visible && (node.father==parent.id || node.mother==parent.id)){
                
            }
        })
    }

    

}


// display

let a = createTreeMapJson(data);
treeTravel(a, createArrayFromTree);
update(a);