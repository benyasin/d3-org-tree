[![GitHub stars](https://img.shields.io/github/stars/benyasin/d3-org-tree.svg?style=flat-square)](https://github.com/benyasin/d3-org-tree/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/benyasin/d3-org-tree.svg?style=flat-square)](https://github.com/benyasin/d3-org-tree/issues)
[![GitHub forks](https://img.shields.io/github/forks/benyasin/d3-org-tree.svg?style=flat-square)](https://github.com/benyasin/d3-org-tree/network)
[![GitHub last commit](https://img.shields.io/github/last-commit/benyasin/d3-org-tree.svg?style=flat-square)](https://github.com/benyasin/d3-org-tree)

# d3-org-tree


<img src="https://user-images.githubusercontent.com/1866848/87675987-a08a3000-c7aa-11ea-93f4-6e164c3b0823.png" align="left" width="80px" hspace="5" vspace="5">

#### A highly customizable org tree built with d3.js v5

<br/>

![tree](https://user-images.githubusercontent.com/1866848/87697076-3da59280-c7c4-11ea-830c-91f3727067ec.png)


## Demo

* <a target="_blank" href="https://github.com/benyasin/d3-org-tree-vue-demo">Vue integration demo</a>

## Installing

```
npm i d3-org-tree
```

## Usage

```javascript
import OrgTree from "d3-org-tree";

const orgTree = new OrgTree()
orgTree.container('body') //dom element
       .data(/**{}*/)     //data json array, example as below
       .svgWidth(800)
       .svgHeight(600)
       .initialZoom(.4)
       .highlight({
            "borderWidth": 1,
            "borderRadius": 15,
            "borderColor": {"red": 50,"green": 255,"blue": 30,"alpha": 1},
            "backgroundColor": {"red": 20,"green": 100,"blue": 40,"alpha": 1}
        })
       .onNodeClick(d => {
            console.log(d + " node clicked")
        })
        .onNodeAdd(d => {
            console.log(d + " node added")
            orgTree.addNode(/*added node json*/)
        })
        .onNodeRemove(d => {
            console.log(d + " node removed")
            orgTree.remove(/*removed nodeId*/)
        })
       .render()
```

**data example**:
```json
[{
    "nodeId": "O-1",
    "parentNodeId": null,
    "width": 325,
    "height": 139,
    "borderWidth": 1,
    "borderRadius": 15,
    "borderColor": {"red": 50,"green": 255,"blue": 30,"alpha": 1},
    "backgroundColor": {"red": 20,"green": 100,"blue": 40,"alpha": 1},
    "template": "<div>\n <div style=\"margin-left:10px;\n margin-top:35px;\n font-size:40px;\n font-weight:bold;\n\">Ben</div></div>",
    "connectorLineColor": {"red": 11,"green": 123, "blue": 108, "alpha": 1},
    "connectorLineWidth": 5,
    "dashArray": "",
    "expanded": true,
    "added": false,
    "removed": false
  },
  {
    "nodeId": "O-2",
    "parentNodeId": "O-1",
    "width": 319,
    "height": 134,
    "borderWidth": 1,
    "borderRadius": 15,
    "borderColor": {"red": 50,"green": 255,"blue": 30,"alpha": 1},
    "backgroundColor": {"red": 20,"green": 100,"blue": 40,"alpha": 1},
    "template": "<div>\n <div style=\"margin-left:10px;\n margin-top:35px;\n font-size:40px;\n font-weight:bold;\n\">Honey</div></div>",
    "connectorLineColor": {"red": 11,"green": 123, "blue": 108, "alpha": 1},
    "connectorLineWidth": 5,
    "dashArray": "",
    "expanded": true,
    "added": true,
    "removed": true
  }]
```
## API
            
|  Properties  | Usage |
|  --- | --- |
|  svgWidth  | `number`, the svg width, and will be 100% of the container's width if not set|
|  svgHeight  | `number`, the svg height, and will be `600` if not set |
|  container  | `string`, the svg dom selector, can be a class name or dom tag name, the default value is `body`|
|  backgroundColor  | `string`, background color of the svg container, the default value is `#fafafa` |
|  data  | `array`, all nodes data definition, the data struct can be seen above |
|  highlight  | `object`, define highlight styles of the current node |
|  current  | `string`, mark the current chosen node |
|  duration  | `number`, the transition duration, the default value is `600` |
|  strokeWidth  | `number`, the stroke width of node, the default value is `3` |
|  initialZoom  | `number`, the initial zoom scale, the default value is `1` |
|  orientation  | `string`, the layout orientation, which value is one of `left-to-right`、`right-to-left`、`top-to-bottom`、`bottom-to-top`, and the default one is `right-to-left` |

|  Method  | Usage |
|  --- | --- |
|  onNodeClick(nodeId)  | `function`, callback after node clicked |
|  onNodeAdd(nodeId)  | `function`, callback after the add button clicked |
|  onNodeRemove(nodeId)  | `function`,callback after the remove button clicked |

|  Callback  | Usage |
|  --- | --- |
|  transformLayout(orientation)  | `function`, change the the layout orientation, the passed value can be `left-to-right`、`right-to-left`、`top-to-bottom`、`bottom-to-top` |
|  addNode(nodeJson)  | `function`, add a children node under a parent node you clicked |
|  removeNode(nodeId)  | `function`, remove a node by the nodeId |

## Changelog

**0.0.3** Changes:

* Fixed node distance bug
* Added a vue integrated demo

**0.0.2** Changes:

* Added layout orientation support
* Completed documentation

**0.0.1** Changes:

* The initial version first publish to npm library

## Contributing

If the existing component doesn't meet your needs, fork the project, implement the future and an example using it, send us a pull request, for consideration for inclusion in the project.

If you'd like to contribute consistently, show me what you've got with some good pull requests!