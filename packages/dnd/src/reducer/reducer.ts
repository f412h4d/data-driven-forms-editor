import { StateContext } from '../state-context';
import { AnyObject } from '../types';

export interface ReducerAction extends AnyObject {
	type: 'DRAG_START' | 'DRAG_DROP' | 'UPDATE_CONTAINER' | 'UPDATE_COMPONENT';
}

export const clearDrag = {
	draggingElement: null,
	sourceContainer: null,
	draggingProps: null
};

export const initialState: StateContext = {
	...clearDrag,
	components: {},
	containers: {
		root: {
			children: [],
			ref: undefined
		}
	},
};

export const dragStart = (state: StateContext, action: ReducerAction) => ({
	...state,
	draggingElement: action.component,
	sourceContainer: action.sourceContainer,
	draggingProps: action.props
});

export const dragDrop = (state: StateContext, action: ReducerAction) => {
	console.debug("STARTED DRAG_DROP")
	console.log("STARTED DRAG_DROP")
	console.warn("STARTED DRAG_DROP")
	console.error("STARTED DRAG_DROP")


	// dragging outside container
	if (!action.targetContainer) {
		console.log("dragging outside container")

		return {
			...state,
			...clearDrag,
		};
	}

	const isDraggingContainer = Boolean(state.draggingElement && state.containers[state.draggingElement]);

	// dragging container into itself
	if (isDraggingContainer && state.draggingElement === action.targetContainer) {
		console.log("dragging container into itself")

		return {
			...state,
			...clearDrag,
		};
	}

	// dragging container into sub-container
	if (isDraggingContainer) {
		let parentContainer = Object.keys(state.containers).find(key => state.containers[key].children.includes(action.targetContainer));

		// check all parent containers
		while (parentContainer && parentContainer !== 'root' && parentContainer !== state.draggingElement) {
			// eslint-disable-next-line no-loop-func
			parentContainer = Object.keys(state.containers).find(key => state.containers[key].children.includes(parentContainer as string));
			console.log('parent', parentContainer);
		}
		console.log("dragging container into sub-container [IF FALSE]")

		if (parentContainer === state.draggingElement) {
			console.log("dragging container into sub-container [IF TRUE]")
			return {
				...state,
				...clearDrag,
			};
		}
	}

	// is moving to the same position
	if (state.sourceContainer
        &&
        state.sourceContainer === action.targetContainer
        // is being moved to the same position or after the position
        && (
        	state.containers[state.sourceContainer].children.indexOf(state.draggingElement as string) === action.position ||
            state.containers[state.sourceContainer].children.indexOf(state.draggingElement as string) + 1 === action.position
        )
	) {
		console.log("is moving to the same position")

		return {
			...state,
			...clearDrag,
		};
	}

	// generate id for new items or used the old one
	const id = action.id || state.sourceContainer ? state.draggingElement : `${state.draggingElement}-${Date.now()}`;

	console.log(`Generated ID: ${id}`)

	// remove item from the old container, or create a new one
	if (state.sourceContainer) {
		console.log("remove item from the old container, or create a new one")

		state.containers[state.sourceContainer].children = state.containers[state.sourceContainer].children.filter((child: string) => child !== id);
	}

	// push to the exact position
	// when position is not specified, push to the bottom
	if (typeof action.position === 'undefined') {
		console.log("push to the bottom")

		state.containers[action.targetContainer].children.push(id as string);
	} else {
		console.log(`push to the selected position`)

		state.containers[action.targetContainer].children.splice(action.position, 0, id as string);
	}

	// moving existing node
	if (state.sourceContainer) {
		console.log("moving existing node")

		return {
			...state,
			...clearDrag,
		};
		// inserting a new node
	} else {
		console.log("inserting a new node")
		console.log("if dragging component add a component")

		// if dragging component add a component
		return {
			...state,
			...clearDrag,
			...(action.targetContainer && {
				components: {
					...state.components,
					[id as string | number]: {
						component: state.draggingElement,
						name: id,
						...state.draggingProps
					}
				},
			})
		};
	}
};

export const updateContainer = (state: StateContext, action: ReducerAction) => {
	if(state.containers[action.id]) {
		state.containers[action.id].ref = action.ref;
	} else {
		state.containers[action.id] = {
			ref: action.ref,
			children: []
		};
	}

	return state;
};

export const updateComponent = (state: StateContext, action: ReducerAction) => {
	state.components[action.id].ref = action.ref;

	return state;
};

export const reducer = (state: StateContext, action: ReducerAction) => {
	switch (action.type) {
	case 'DRAG_START':
		return dragStart(state, action);
	case 'DRAG_DROP':
		return dragDrop(state, action);
	case 'UPDATE_CONTAINER':
		return updateContainer(state, action);
	case 'UPDATE_COMPONENT':
		return updateComponent(state, action);
	}
};

export default reducer;
