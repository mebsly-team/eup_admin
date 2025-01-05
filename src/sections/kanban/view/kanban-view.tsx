import { useCallback, useEffect, useState } from 'react';
import { Droppable, DropResult, DragDropContext } from '@hello-pangea/dnd';

import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { moveTask, moveColumn, useGetBoard } from 'src/api/kanban';

import Scrollbar from 'src/components/scrollbar';
import EmptyContent from 'src/components/empty-content';

import KanbanColumn from '../kanban-column';
import KanbanColumnAdd from '../kanban-column-add';
import { KanbanColumnSkeleton } from '../kanban-skeleton';
import { IUserItem } from 'src/types/user';
import axiosInstance from 'src/utils/axios';
import { fontSize, fontWeight, width } from '@mui/system';

// ----------------------------------------------------------------------
const columns = [
  {
    id: 0,
    name: 'DOEN',
  },
  {
    id: 1,
    name: 'ONDERHANDEN',
  },
  {
    id: 2,
    name: 'TESTEN',
  },
  {
    id: 3,
    name: 'KLAAR',
  },
];
export default function KanbanView() {
  const [userList, setUserList] = useState<IUserItem[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [board, setBoard] = useState([]);

  useEffect(() => {
    getAllTasks();
    if (!userList?.length) getAllUsers();
  }, []);

  const getAllTasks = async () => {
    setLoading(true);
    const { data } = await axiosInstance.get(`/kanban/`);
    setBoard(data || []);
    setLoading(false);
  };
  const getAllUsers = async () => {
    const typeFilter = `&type=admin`;
    const { data } = await axiosInstance.get(`/users/?${typeFilter}`);
    setUserList(data || []);
  };

  const onDragEnd = useCallback(
    async ({ destination, source, draggableId, type }: DropResult) => {
      try {
        if (!destination) {
          return;
        }

        if (destination.droppableId === source.droppableId && destination.index === source.index) {
          return;
        }

        // Moving column
        if (type === 'COLUMN') {
          const newOrdered = [...board];

          newOrdered.splice(source.index, 1);

          newOrdered.splice(destination.index, 0, draggableId);

          moveColumn(newOrdered);
          return;
        }

        const sourceColumn = columns[source.droppableId];

        const destinationColumn = columns[destination.droppableId];

        // Moving task to same list
        if (sourceColumn.id === destinationColumn.id) {
          const newTaskIds = [...sourceColumn.taskIds];

          newTaskIds.splice(source.index, 1);

          newTaskIds.splice(destination.index, 0, draggableId);

          moveTask({
            ...columns,
            [sourceColumn.id]: {
              ...sourceColumn,
              taskIds: newTaskIds,
            },
          });

          console.info('Moving to same list!');

          return;
        }

        // Moving task to different list
        const sourceTaskIds = [...sourceColumn.taskIds];

        const destinationTaskIds = [...destinationColumn.taskIds];

        // Remove from source
        sourceTaskIds.splice(source.index, 1);

        // Insert into destination
        destinationTaskIds.splice(destination.index, 0, draggableId);

        moveTask({
          ...columns,
          [sourceColumn.id]: {
            ...sourceColumn,
            taskIds: sourceTaskIds,
          },
          [destinationColumn.id]: {
            ...destinationColumn,
            taskIds: destinationTaskIds,
          },
        });

        console.info('Moving to different list!');
      } catch (error) {
        console.error(error);
      }
    },
    [columns, board]
  );

  const renderSkeleton = (
    <Stack direction="row" alignItems="flex-start" spacing={3}>
      {[...Array(4)].map((_, index) => (
        <KanbanColumnSkeleton key={index} index={index} />
      ))}
    </Stack>
  );

  return (
    <Container
      maxWidth={false}
      sx={{
        height: 1,
      }}
    >
      <Typography
        variant="h4"
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        Kanban
      </Typography>

      {isLoading && renderSkeleton}

      {/* {!board?.length && (
        <EmptyContent
          filled
          title="No Data"
          sx={{
            py: 10,
            maxHeight: { md: 480 },
          }}
        />
      )} */}

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="board" type="COLUMN" direction="horizontal">
          {(provided) => (
            <Scrollbar
              sx={{
                height: 1,
                minHeight: {
                  xs: '80vh',
                  md: 'unset',
                },
              }}
            >
              <Stack
                ref={provided.innerRef}
                {...provided.droppableProps}
                spacing={3}
                direction={{ xs: 'column', md: 'row' }}
                alignItems={{ xs: 'center', md: 'flex-start' }}
                sx={{
                  p: 0.25,
                  height: 1,
                }}
              >
                {columns?.map((col, index) => (
                  <KanbanColumn
                    index={index}
                    key={index}
                    column={col}
                    tasks={board.filter((items) => items.status === col.id)}
                    userList={userList}
                    getAllTasks={getAllTasks} 
                  />

                ))}

                {provided.placeholder}

                {/* <KanbanColumnAdd /> */}
              </Stack>
            </Scrollbar>
          )}
        </Droppable>
      </DragDropContext>
    </Container>
  );
}
