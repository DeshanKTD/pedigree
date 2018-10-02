let data = [{
        "name": "Lisbon",
        "family-name": "Doe",
        "id": "doe-0",
        "gender": "male",
        "mother": null,
        "father": null,
        "partners": [],
        "children": ["doe-1"]
    },


    {
        "name": "John",
        "family-name": "Doe",
        "id": "doe-1",
        "gender": "male",
        "mother": null,
        "father": "doe-0",
        "partners": ["daniel-1"],
        "children": ["doe-2", "doe-3"]
    },

    {
        "name": "Natalia",
        "family-name": "Daniel",
        "id": "daniel-1",
        "gender": "female",
        "mother": null,
        "father": null,
        "partners": ["doe-1"],
        "children": ["doe-2", "doe-3"]
    },

    {
        "name": "Martin",
        "family-name": "Doe",
        "id": "doe-2",
        "gender": "male",
        "mother": "daniel-1",
        "father": "doe-1",
        "partners": ["lawrance-1"],
        "children": ["doe-4"]
    },

    {
        "name": "Anna",
        "family-name": "Doe",
        "id": "doe-3",
        "gender": "female",
        "mother": "daniel-1",
        "father": "doe-1",
        "partners": [],
        "children": []
    },

    {
        "name": "Brad",
        "family-name": "Lawrance",
        "id": "lawrance-2",
        "gender": "male",
        "mother": null,
        "father": null,
        "partners": ["pitt-1"],
        "children": ["lawrance-1"]
    },

    {
        "name": "Maggie",
        "family-name": "Pitt",
        "id": "pitt-1",
        "gender": "female",
        "mother": null,
        "father": null,
        "partners": ["lawrance-2"],
        "children": ["lawrance-1"]
    },

    {
        "name": "Jane",
        "family-name": "Lawrance",
        "id": "lawrance-1",
        "gender": "female",
        "mother": "pitt-1",
        "father": "lawrance-2",
        "partners": ["doe-2"],
        "children": ["doe-4"]
    },

    {
        "name": "Robert",
        "family-name": "Doe",
        "id": "doe-4",
        "gender": "male",
        "mother": "lawrance-1",
        "father": "doe-2",
        "partners": [],
        "children": []
    }

];




function addvisitedAttr(data) {
    data.forEach(function (node) {
        node.visited = false;
    });
}

addvisitedAttr(data);


//get node by id
function getNode(id) {
    let returnNode = null;
    data.forEach(function (node) {
        // console.log(node.id);
        if (node.id == id) {
            returnNode = node
        }
    });
    return returnNode;
}


//get nodes with no parents
function getNodesWithNoParents(data) {
    let nodeList = [];

    data.forEach(function (node) {
        if (node.mother == null && node.father == null) {
            nodeList.push(node);
        }
    });

    return nodeList;
}



// count height of root ancestor
function countHeightRootAncestor(id, count) {
    let node = getNode(id);
    let nodeOne = null;
    let nodeTwo = null;

    if (node) {
        if (node.mother) {
            nodeOne = countHeightRootAncestor(node.mother, count + 1);
        }
        if (node.father) {
            nodeTwo = countHeightRootAncestor(node.father, count + 1);
        }
    }

    if (nodeOne && nodeTwo) {
        if (nodeOne.count > nodeTwo.count) {
            return {
                node: nodeOne.node,
                count: nodeOne.count
            }
        } else {
            return {
                node: nodeTwo.node,
                count: nodeTwo.count
            }
        }
    } else if (nodeOne) {
        return {
            node: nodeOne.node,
            count: nodeOne.count
        }
    } else if (nodeTwo) {
        return {
            node: nodeTwo.node,
            count: nodeTwo.count
        }
    }

    return {
        node: node,
        count: count
    };
}


// get a first node of tree
function getRootOfTree(data) {
    let rootChildren = _getAllChildrensWithNoChildren(data);
    let rootAncestors = [];
    let rootAncestor = null;

    rootChildren.forEach(function (node) {
        rootAncestors.push(countHeightRootAncestor(node.id, 0));
    });

    rootAncestors.forEach(function (node) {
        if (rootAncestor == null) {
            rootAncestor = node;
        } else {
            if (node.count > rootAncestor.count) {
                rootAncestor = node;
            }
        }
    });

    return rootAncestor.node;
}


// select childrent with no more children
function _getAllChildrensWithNoChildren(data) {
    let children = [];

    data.forEach(function (node) {
        if (node.children.length == 0) {
            children.push(node);
        }
    });

    return children;
}

// mark the level or generation
function markGeneration(data) {
    let root = getRootOfTree(data);
    _markGenerationTraveller(root.id, 0);
    addvisitedAttr(data);
}


function _markGenerationTraveller(id, generation) {
    let node = getNode(id);
    if (node.visited) {
        return;
    }
    node.visited = true;
    node.visible = true;

    node.generation = generation;

    if (node.mother) {
        _markGenerationTraveller(node.mother, generation - 1);
    }
    if (node.father) {
        _markGenerationTraveller(node.father, generation - 1);
    }

    if (node.children.length > 0) {
        node.children.forEach(function (id) {
            _markGenerationTraveller(id, generation + 1);
        })
    }

    if (node.partners.length > 0) {
        node.partners.forEach(function (id) {
            _markGenerationTraveller(id, generation);
        })
    }

    return;
}



// let a = getRootAncestor("doe-4",0);
// console.log(a);

// console.log(getNode("daniel-1"));

// markGeneration(data);
// console.log(data);




function createTreeMapJson(data) {
    markGeneration(data);
    let shortRootArray = [];

    let rootAncestors = getNodesWithNoParents(data);


    // start from main root to get all children of it with partners
    let mainRootNode = { ...getRootOfTree(data)
    };
    recursiveTreeBuilder(mainRootNode);


    // generate tree for not main root
    rootAncestors.forEach(function (root) {
        if (root.id != mainRootNode.id && !root.visited) {
            recursiveTreeBuilder(root);
            let treeFlow = addBlankParentNodes(root);
            shortRootArray.push(treeFlow);
        }
    });


    // clear visited data
    addvisitedAttr(data);


    return _bindShortTreesToSingle(mainRootNode, shortRootArray);

}


// recusively generate tree by nodes
function recursiveTreeBuilder(node) {
    let children = node.children;
    let childArray = [];

    children.forEach(function (child) {
        let childNodeOriginal = getNode(child)
        let childNode = { ...childNodeOriginal
        };


        if (!childNode.visited) {
            childNodeOriginal.visited = true;
            childArray.push(childNode);

            childNode.partners.forEach(function (partner) {
                let partnerNodeOriginal = getNode(partner);
                let partnerNode = { ...partnerNodeOriginal
                };

                if (!partnerNode.visited) {
                    partnerNodeOriginal.visited = true;
                    childArray.push(partnerNode);
                }
            });
        }


    })
    childArray.forEach(function (child) {
        recursiveTreeBuilder(child);
    })
    node.children = childArray;

};


// create blank nodes fill generation gaps
function addBlankParentNodes(shortTree) {
    let generation = shortTree.generation;
    var child = shortTree;

    if (generation > 0) {
        let generationCount = generation - 1;

        while (generationCount >= 0) {
            let blankNode = _createBlankParentNode(generationCount, child);
            child = blankNode;
            generationCount--;
        }
    }

    return child;
}


function _createBlankParentNode(generation, child) {
    let node = {};
    node.generation = generation;
    node.visible = false;
    node.children = [];
    node.children.push(child);

    return node;
}

// make a single tree
function _bindShortTreesToSingle(root, shortRootArray) {
    let mainTree = {};
    mainTree.generation = -1;
    mainTree.visible = false;

    mainTree.children = [];
    mainTree.children.push(root);

    shortRootArray.forEach(function (subRoot) {
        mainTree.children.push(subRoot);
    });

    return mainTree;

}


// create a object array from tree which hv object rather than ids
function createArrayFromTree(node) {
    if (node.visible) {
        d3DataArray.push(node);
    }
}

// clear visted property
function resetVisitedInTreeArray(node) {
    node.visited = false;
}


// traverse the tree
function treeTravel(node, callback) {
    callback(node);

    node.children.forEach(function (child) {
        treeTravel(child, callback)
    })
}


// get object by id
function getObjectNodeById(data, id) {
    let returnNode = null;
    data.forEach(function (node) {
        if (node.id == id) {
            returnNode = node;
        }
    });

    return returnNode;
}


// get the max generation
function getMaxGeneration(data) {
    let max = 0;

    data.forEach(function (node) {
        if (node.visible) {
            if (node.generation > max) {
                max = node.generation;
            }
        }
    });

    return max;
}