var json = require('./data.json');

// get node id by name
function getNodebyName(nodeId,nodes){
    let returnNode = null;
    nodes.forEach(node => {
        if(node.name === nodeId){
            returnNode = node;
        }
    });

    return returnNode;
}

// get root nodes of tree
function findTopNodes(nodes){
    let topNodes = [];
    
    nodes.forEach(element => {
        if ('top_level' in element && element.top_level) {
            topNodes.push(element);
        }
    });

    return topNodes;
}

// init basic properties of each node
function initProperties(nodes){
    nodes.forEach(node => {
        node.children = [];
        node.partners = [];
        node.diseases = [];
        node.visited = false;
    })
}



// add children node to each node
function getChildren(currentNode, nodes){
    let children = [];

    nodes.forEach(node => {
        if(!('noparents' in node)){
            if(currentNode.sex==='F'&& 'mother' in node && currentNode.name===node.mother){
                children.push(node);
            }

            else if(currentNode.sex==='M'&& 'father' in node && currentNode.name===node.father){
                children.push(node);
            }
        }
    });

    currentNode.children = children;
}


function getPartners(currentNode, nodes){
    let partners = [];

    if(currentNode.children.length>0){
        currentNode.children.forEach(node => {
            let partner = null;
            if(currentNode.sex === 'F'){
                partner = getNodebyName(node.father,nodes);
            }else{
                partner = getNodebyName(node.mother,nodes);
            }

            if(!_checkPartnerExists(partner,partners)){
                partners.push(partner);
            }
        })
    }

    currentNode.partners = partners;
}



// create partners
function _checkPartnerExists(partner, partners){
    let isExists= false;
    if(partners.length==0)
        return isExists;
    
    partners.forEach(node => {
        if(partner.name === node.name){
            isExists=true;
        }
    });

    return isExists;
    
}


function createGraph(nodes){
    
    initProperties(nodes);
    let unvisitedNodes = findTopNodes(nodes);

    while(unvisitedNodes){
        let node = _getFirstItem(unvisitedNodes);
    
    }
    
}


function _getFirstItem(array){
    if(array.length==0)
        return null;

    let item = null;

    array = array.reverse();
    item = array.pop();

    return item;
}