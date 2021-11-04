import { useCallback } from "react";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import DeleteIcon from "@material-ui/icons/Delete";
import { makeStyles } from "@material-ui/core/styles";
import classnames from "classnames";
import { motion } from "framer-motion";
import { TodoItem, useTodoItems } from "./TodoItemsContext";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const spring = {
  type: "spring",
  damping: 25,
  stiffness: 120,
  duration: 0.25,
};

const useTodoItemListStyles = makeStyles({
  root: {
    listStyle: "none",
    padding: 0,
  },
});

export const TodoItemsList = function () {
  const { todoItems, dispatch } = useTodoItems();
  const classes = useTodoItemListStyles();

  // const sortedItems = todoItems.slice().sort((a, b) => {
  //   if (a.done && !b.done) {
  //     return 1;
  //   }

  //   if (!a.done && b.done) {
  //     return -1;
  //   }

  //   return 0;
  // });
  const sortedItems = todoItems;

  function onDragEnd(result: {
    source: { index: number };
    destination?: { index: number };
  }) {
    if (!result.destination) {
      return;
    }

    if (result.destination.index === result.source.index) {
      return;
    }

    dispatch({
      type: "reorder",
      data: {
        startIndex: result.source.index,
        endIndex: result.destination.index,
      },
    });
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="list">
        {(provided) => (
          <ul
            className={classes.root}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {sortedItems.map((item, index) => (
              <Draggable draggableId={item.id} index={index} key={item.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...(provided.draggableProps as any)}
                    {...provided.dragHandleProps}
                  >
                    <motion.li transition={spring} layout={true} drag="y">
                      <TodoItemCard item={item} />
                    </motion.li>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  );
};

const useTodoItemCardStyles = makeStyles({
  root: {
    marginTop: 24,
    marginBottom: 24,
  },
  doneRoot: {
    textDecoration: "line-through",
    color: "#888888",
  },
});

export const TodoItemCard = function ({ item }: { item: TodoItem }) {
  const classes = useTodoItemCardStyles();
  const { dispatch } = useTodoItems();

  const handleDelete = useCallback(
    () => dispatch({ type: "delete", data: { id: item.id } }),
    [item.id, dispatch]
  );

  const handleToggleDone = useCallback(
    () =>
      dispatch({
        type: "toggleDone",
        data: { id: item.id },
      }),
    [item.id, dispatch]
  );

  return (
    <Card
      className={classnames(classes.root, {
        [classes.doneRoot]: item.done,
      })}
    >
      <CardHeader
        action={
          <IconButton aria-label="delete" onClick={handleDelete}>
            <DeleteIcon />
          </IconButton>
        }
        title={
          <FormControlLabel
            control={
              <Checkbox
                checked={item.done}
                onChange={handleToggleDone}
                name={`checked-${item.id}`}
                color="primary"
              />
            }
            label={item.title}
          />
        }
      />
      {item.details ? (
        <CardContent>
          <Typography variant="body2" component="p">
            {item.details}
          </Typography>
        </CardContent>
      ) : null}
    </Card>
  );
};
