[![GitHub stars](https://img.shields.io/github/stars/benyasin/d3-org-tree.svg?style=flat-square)](https://github.com/benyasin/d3-org-tree/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/benyasin/d3-org-tree.svg?style=flat-square)](https://github.com/benyasin/d3-org-tree/issues)
[![GitHub forks](https://img.shields.io/github/forks/benyasin/d3-org-tree.svg?style=flat-square)](https://github.com/benyasin/d3-org-tree/network)
[![GitHub last commit](https://img.shields.io/github/last-commit/benyasin/d3-org-tree.svg?style=flat-square)](https://github.com/benyasin/d3-org-tree)

# d3-org-tree


<img src="https://user-images.githubusercontent.com/1866848/87675987-a08a3000-c7aa-11ea-93f4-6e164c3b0823.png" align="left" width="60px" hspace="5" vspace="5">
A highly customizable org tree built with d3.js v5

<br>


![image](https://user-images.githubusercontent.com/1866848/87562841-10d47b00-c6f1-11ea-84fe-20663fa4664a.png)

### Installing

```
npm i d3-org-tree
```

### Usage

```javascript
import OrgTree from "d3-org-tree";

const orgTree = new OrgTree()
orgTree.container('body') //dom element
       .data({})  //data object
       .svgWidth(800)
       .svgHeight(600)
       .initialZoom(.4)
       .onNodeClick(d => {
            console.log(d + " node clicked")
        })
        .onNodeAdd(d => {
            console.log(d + " node added")
        })
        .onNodeRemove(d => {
            console.log(d + " node removed")
        })
       .render()
```

### API

