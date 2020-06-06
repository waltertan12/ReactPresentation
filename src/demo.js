import { createNode } from 'vDOM';
import { diff } from 'Diff';
import { mount, reconcile } from 'DOM';

let state = {
    input: '',
    todos: [],
};

const onInputKeyUp = (event) => {
    // Update the application state
    state = { ...state, input: event.target.value };

    // Re-render the app
    render();
};

const onButtonClick = event => {
    // No operation if there's not text
    if (state.input.trim() === '') {
      return;    
    }
    
    const nextTodo = state.input.trim();

    // Update the application state
    state = {
        ...state, 
        input: '',
        todos: [ ...state.todos, { content: nextTodo, timestamp: Date.now() } ],
    };

    render();
};

const deleteTodoItem = (key) => {
    const nextTodos = state.todos.slice();
    nextTodos.splice(key, 1);

    state = { ...state, todos: nextTodos };

    render();
}

const TodoApp = (props) => createNode('div', {}, 
    createNode('h1', {}, 'Todo App'),
    createNode('div', { className: 'form-group' },
        createNode(
            'input',
            {
                id: 'input',
                className: 'form-control',
                type: 'text',
                placeholder: 'Do laundry',
                value: props.input,
                onKeyUp: onInputKeyUp
            }
        ),
        createNode('br', {}),
        createNode(
            'button',
            { id: 'button', className: 'btn btn-primary', onClick: onButtonClick },
            'Add Todo'
        )
    ),
    createNode('h2', {}, 'Things to do:'),
    createNode(
        'ul',
        { id: 'list', className: 'list-group' },
        ...props.todos.map((todo, key) => {
            return createNode(
                'li',
                { className: 'list-group-item d-flex justify-content-between', key: todo.timestamp },
                todo.content,
                createNode(
                    'button',
                    { className: 'btn btn-danger', onClick: () => deleteTodoItem(key) },
                    'X'
                )
            );
        })
    )
);

// Mount the initial app
const root = document.getElementById('app');
let app = TodoApp(state);
const mounted = mount(app, root);

const render = () => {
    console.log('NEXT STATE');
    console.log(state);

    const nextApp = TodoApp(state);
    const patches = diff(app, nextApp);

    console.log('DIFFS');
    console.log(patches);

    reconcile(mounted, patches);
    app = nextApp;
};

if (module.hot) {
    module.hot.accept();
}