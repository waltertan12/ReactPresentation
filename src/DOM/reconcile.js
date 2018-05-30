import { applyProps } from 'DOM/applyProps';
import { render } from 'DOM/render';

/**
 * Manipulate the DOM
 * 
 * @param  {Node}   node    The DOM node to update
 * @param  {Array}  patches An array containing data about DOM manipulation
 */
const performReconciliation = (node, patches) => {
    // The list-diff2 library defines these constants
    const REMOVE = 0;
    const INSERT = 1;

    patches
        .forEach(patch => {
            const parentNode = node.parentNode;

            switch (patch.type) {
                case 'REORDER':
                    const childNodeArray = Array.from(node.childNodes);
                    const childNodes = node.childNodes;
                    const moves = patch.patch;


                    // TODO: Create a map from key => childNode
                    moves
                        .forEach(move => {
                            const index = move.index;
                            if (move.type === REMOVE) {
                                if (childNodeArray[index] === childNodes[index] && childNodes[index]) {
                                    node.removeChild(childNodes[index]);
                                } 

                                childNodeArray.splice(index, 1);
                            } else if (move.type === INSERT) {
                                // TODO: Use key map instead of rendering new nodes all the time 
                                const nodeToInsert = render(move.item);

                                childNodeArray.splice(index, 0, nodeToInsert);
                                node.insertBefore(nodeToInsert, childNodes[index] || null);
                            }
                        });
                    break;

                case 'NODE':
                    if (parentNode) {
                        parentNode.replaceChild(render(patch.patch), node);
                    }
                    break;

                case 'INSERT':
                    if (parentNode) {
                        parentNode.appendChild(render(patch.patch), node);
                    }
                    break;

                case 'REMOVE':
                    if (parentNode) {
                        parentNode.removeChild(node);
                    }
                    break;

                case 'TEXT':
                    node.textContent = patch.patch;
                    break;

                case 'PROPS':
                    applyProps(node, patch.patch, patch.node.props);
                    break;

                default:
                    // no-op
            } 
        });
};

/**
 * Apply the patches the diff algorithm found
 *
 * The reconciler must traverse the tree the EXACT same way the diff traversed the tree, otherwise it will incorrectly
 * apply patches
 * 
 * @param  {Node}   node    The actual DOM node representing the current App
 * @param  {Object} patches Diffs that need to be applied to the actual DOM
 * @param  {Object} index   The depth first index of the node
 *                          This needs to be an object because you can't pass primitives by reference
 */
export const reconcile = (node, patches, index = { index: 0 }) => {
    const currentPatches = patches[index.index];
    const nodeArray = Array.from(node.childNodes);

    nodeArray
        .forEach(childNode => {
            index.index += 1;

            reconcile(childNode, patches, index);
        });

    if (currentPatches && currentPatches.length) {
        performReconciliation(node, currentPatches);
    }
};