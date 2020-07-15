# d3-org-tree
A highly customizable org tree built with d3.js v5

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