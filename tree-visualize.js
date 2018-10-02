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
    let partnerLinks = generatePartnerLinks(d3DataArray );
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
        .attr("r", 15)
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

count = 0;

// create box link paths
function createNodePath(node) {

    count++;
    let sourceHeight = node.source.y;
    let sourceWidth = node.source.x;
    let targetHeight = node.target.y;
    let targetWidth = node.target.x;


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


function checkParent(link) {
    let isParent = false;

    let child = link.target;
    let parent = link.source;
    if (link.target.depth < link.source.depth) {
        child = link.source;
        parent = link.target;
    }

    if (child.mother == parent.id || child.father == parent.id) {
        isParent = true;
    }

    return isParent;
}

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

// display

let a = createTreeMapJson(data);
treeTravel(a, createArrayFromTree);
update(a);