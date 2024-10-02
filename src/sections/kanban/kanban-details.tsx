import { useState, useCallback, useEffect } from 'react';
import { useAuthContext } from '../../auth/hooks/use-auth-context';

// ...

import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';

import { styled } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { useBoolean } from 'src/hooks/use-boolean';

import Editor from 'src/components/editor';

import Scrollbar from 'src/components/scrollbar';
import { useDateRangePicker } from 'src/components/custom-date-range-picker';

import { IKanbanTask } from 'src/types/kanban';
import { IKanbanComment } from 'src/types/kanban';

import KanbanInputName from './kanban-input-name';
import KanbanDetailsToolbar from './kanban-details-toolbar';
import KanbanDetailsPriority from './kanban-details-priority';
import KanbanDetailsAttachments from './kanban-details-attachments';
import KanbanDetailsCommentList from './kanban-details-comment-list';
import KanbanDetailsCommentInput from './kanban-details-comment-input';
import TaskAssignee from './kanban-details-assignee-modal';
import { Accordion, AccordionDetails, AccordionSummary, MenuItem, Select, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslate } from 'src/locales';


// ----------------------------------------------------------------------

export const StyledLabel = styled('span')(({ theme }) => ({
  ...theme.typography.caption,
  width: 100,
  flexShrink: 0,
  color: theme.palette.text.secondary,
  fontWeight: theme.typography.fontWeightSemiBold,
}));

// ----------------------------------------------------------------------

type Props = {
  task: IKanbanTask;
  taskId: string;
  openDetails: boolean;
  onCloseDetails: () => void;
  onUpdateTask: (updateTask: IKanbanTask) => void;
  onDeleteTask: VoidFunction;
};


export default function KanbanDetails({
  task,
  taskId,
  openDetails,
  onCloseDetails,
  onUpdateTask,
  onDeleteTask,
}: Props) {

  const { t } = useTranslate();
  const [priority, setPriority] = useState(task.priority);
  const [quillFull, setQuillFull] = useState(task.description);
  const [currentTask, setCurrentTask] = useState(task);
  const [taskName, setTaskName] = useState(task.title);
  const [expanded, setExpanded] = useState(false);

  const like = useBoolean();

  const contacts = useBoolean();

  const rangePicker = useDateRangePicker(task.due_date, task.due_date);

 
  useEffect(() => {
    setCurrentTask(task);
  }, [task]);

  const handleChangeTaskName = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setTaskName(event.target.value);
  }, []);

  const handleUpdateTask = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      try {
        if (event.key === 'Enter') {
          if (taskName) {
            onUpdateTask({
              ...task,
              name: taskName,
            });
          }
        }
      } catch (error) {
        console.error(error);
      }
    },
    [onUpdateTask, task, taskName]
  );

  const handleChangePriority = useCallback((newValue: string) => {
    setPriority(newValue);
  }, []);

  const renderHead = (
    <KanbanDetailsToolbar
      liked={like.value}
      taskName={task.title}
      onLike={like.onToggle}
      onDelete={onDeleteTask}
      taskStatus={task.status}
      onCloseDetails={onCloseDetails}
    />
  );

  const handleStatusChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const newStatus = event.target.value as number;
    const updatedTask = {
      ...task,
      status: newStatus,
    };
    onUpdateTask(updatedTask);
  };

  const renderStatus = (
    <Stack direction="row" alignItems="center">
      <StyledLabel>{t('status')}</StyledLabel>
      <Select
        value={task.status}
        onChange={handleStatusChange}
        sx={{ width: '100%' }}
      >
        <MenuItem value={0}>{t('doing')}</MenuItem>
        <MenuItem value={1}>{t('review')}</MenuItem>
        <MenuItem value={2}>{t('test')}</MenuItem>
        <MenuItem value={3}>{t('done')}</MenuItem>
      </Select>
    </Stack>
  );

  const renderName = (
    <KanbanInputName
      placeholder="Taaknaam"
      value={taskName}
      onChange={handleChangeTaskName}
      onKeyUp={handleUpdateTask}
    />
  );
  const { user } = useAuthContext();

  
  const renderReporter = (
    <Stack direction="row" alignItems="center">
      <StyledLabel>Reporter</StyledLabel>
      <Avatar alt={user?.displayName} src={user?.photoURL} />
    </Stack>
  );

  // const renderAssignee = (
  //   <Stack direction="row">
  //     <StyledLabel sx={{ height: 40, lineHeight: '40px' }}>Assignee</StyledLabel>

  //     <Stack direction="row" flexWrap="wrap" alignItems="center" spacing={1}>
  //       {/* {task.assignee?.map((user) => (
  //         <Avatar key={user.id} alt={user.name} src={user.avatarUrl} />
  //       ))} */}

  //       <Tooltip title="Add assignee">
  //         <IconButton
  //           onClick={contacts.onTrue}
  //           sx={{
  //             bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
  //             border: (theme) => `dashed 1px ${theme.palette.divider}`,
  //           }}
  //         >
  //           <Iconify icon="mingcute:add-line" />
  //         </IconButton>
  //       </Tooltip>
  //     </Stack>
  //   </Stack>
  // );

  const renderDueDate = (
    <Stack direction="row" alignItems="center">
      <StyledLabel> Due date </StyledLabel>

      <DatePicker
        value={new Date(task.due_date)}
        // onChange={(newValue) => {
        //   setValue(newValue);
        // }}
        slotProps={{
          textField: {
            fullWidth: true,
            margin: 'normal',
          },
        }}
      />
    </Stack>
  );

  const renderPriority = (
    <Stack direction="row" alignItems="center">
      <StyledLabel>Priority</StyledLabel>

      <KanbanDetailsPriority priority={priority} onChangePriority={handleChangePriority} />
    </Stack>
  );

  const renderDescription = (
    <Stack direction="row">
      <StyledLabel> Description </StyledLabel>
      <Editor id="full-editor" value={quillFull} onChange={(value) => setQuillFull(value)} />
    </Stack>
  );

  const renderAttachments = (
    <Stack direction="row">
      <StyledLabel>Attachments</StyledLabel>
      <KanbanDetailsAttachments attachments={task.attachments} />
    </Stack>
  );

  const handleAddComment = useCallback((newComment: IKanbanComment) => {
    const updatedTask = {
      ...currentTask,
      comments: [...(currentTask.comments || []), newComment],
    };
    setCurrentTask(updatedTask);
    onUpdateTask(updatedTask);
    setExpanded(true);
  }, [currentTask, onUpdateTask]);

  const handleExpand = (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded);
  };

  const renderComments = (
    <Accordion expanded={expanded} onChange={handleExpand}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="comments-content"
        id="comments-header"
      >
        <Typography variant="subtitle2">
          {t('comment')} ({currentTask.comments?.length || 0})
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <KanbanDetailsCommentList comments={currentTask.comments || []} />
      </AccordionDetails>
    </Accordion>
  );

  return (
    <Drawer
      open={openDetails}
      onClose={onCloseDetails}
      anchor="right"
      slotProps={{
        backdrop: { invisible: true },
      }}
      PaperProps={{
        sx: {
          width: {
            xs: 1,
            sm: 480,
          },
        },
      }}
    >
      {renderHead}

      <Divider />

      <Scrollbar
        sx={{
          height: 1,
          '& .simplebar-content': {
            height: 1,
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Stack
          spacing={3}
          sx={{
            pt: 3,
            pb: 5,
            px: 2.5,
          }}
        >
          {renderName}

          {renderReporter}

          {renderStatus}

          {/* {renderAssignee} */}

          {task && (
        <TaskAssignee 
          taskId={task.id} 
          
          assignedUsers={Array.isArray(task.assignee) ? task.assignee : []}
          
          onUpdateAssignees={(updatedAssignees) => {
            if (typeof onUpdateTask === 'function') {
              onUpdateTask({
                ...task,
                assignee: updatedAssignees,
              });
            } else {
              console.error('onUpdateTask is not a function');
            }
          }}
        />
      )}
          {renderDueDate}

          {renderPriority}

          {renderDescription}

          {renderComments}
        </Stack>

        
      </Scrollbar>

     
      <KanbanDetailsCommentInput onAddComment={handleAddComment} />
    </Drawer>
  );
}
