import { useState, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { alpha, styled } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import moment from 'moment';

import { useBoolean } from 'src/hooks/use-boolean';

import Editor from 'src/components/editor';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useDateRangePicker } from 'src/components/custom-date-range-picker';

import { IKanbanTask } from 'src/types/kanban';

import KanbanInputName from './kanban-input-name';
import KanbanDetailsToolbar from './kanban-details-toolbar';
import KanbanDetailsPriority from './kanban-details-priority';
import KanbanDetailsAttachments from './kanban-details-attachments';
import KanbanDetailsCommentList from './kanban-details-comment-list';
import KanbanDetailsCommentInput from './kanban-details-comment-input';
import KanbanContactsDialog from './kanban-contacts-dialog';
import { Button } from '@mui/material';

// ----------------------------------------------------------------------

const StyledLabel = styled('span')(({ theme }) => ({
  ...theme.typography.caption,
  width: 100,
  flexShrink: 0,
  color: theme.palette.text.secondary,
  fontWeight: theme.typography.fontWeightSemiBold,
}));

// ----------------------------------------------------------------------

type Props = {
  task: IKanbanTask;
  openDetails: boolean;
  onCloseDetails: VoidFunction;
  //
  onUpdateTask: (updateTask: IKanbanTask) => void;
  onDeleteTask: VoidFunction;
  assignee: any;
  reporter: any;
};

export default function KanbanDetails({
  task,
  openDetails,
  onCloseDetails,
  //
  onUpdateTask,
  onDeleteTask,
  assignee,
  reporter,
  userList,
  column, handleAddComment
}: Props) {

  const [quillFull, setQuillFull] = useState(task.description);

  const [taskName, setTaskName] = useState(task.title);

  const like = useBoolean();

  const contacts = useBoolean();

  const rangePicker = useDateRangePicker(task.due_date, task.due_date);

  const handleChangeTaskName = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setTaskName(event.target.value);
  }, []);

  const handleUpdateTaskName = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      try {
        if (event.key === 'Enter') {
          if (taskName) {
            onUpdateTask(task.id, {
              ...task,
              title: taskName,
            });
          }
        }
      } catch (error) {
        console.error(error);
      }
    },
    [onUpdateTask, task, taskName]
  );

  const handleChangePriority = (newValue: string) => {
    onUpdateTask(task.id, {
      ...task,
      priority: newValue
    });
  }

  const handleSaveDescription = useCallback(() => {
    onUpdateTask(task.id, {
      ...task,
      description: quillFull
    });
  }, [quillFull]);

  const handleDateChange = useCallback((newValue: string) => {
    onUpdateTask(task.id, {
      ...task,
      due_date: moment.isDate(newValue)
        ? moment(newValue).format('YYYY-MM-DD')
        : null
    });
  }, []);

  const renderHead = (
    <KanbanDetailsToolbar
      liked={like.value}
      task={task}
      onLike={like.onToggle}
      onDelete={onDeleteTask}
      taskStatus={column.name}
      onCloseDetails={onCloseDetails}
      onUpdateTask={onUpdateTask}
    />
  );

  const renderName = (
    <KanbanInputName
      placeholder="Taaknaam"
      value={taskName}
      onChange={handleChangeTaskName}
      onKeyUp={handleUpdateTaskName}
    />
  );

  const renderReporter = (
    <Stack direction="row" alignItems="center">
      <StyledLabel>Reporter</StyledLabel>
      <Avatar
        src={reporter?.url}
        alt={reporter?.fullname}
        sx={{
          width: 36,
          height: 36,
          border: (theme) => `solid 2px ${theme.palette.background.default}`,
          fontSize: "0.75rem"
        }}
      >
        {reporter?.first_name?.charAt(0).toUpperCase()} {reporter?.last_name?.charAt(0).toUpperCase()}
      </Avatar>
    </Stack>
  );

  const handleDialogClose = ({ id }) => {
    onUpdateTask(task.id, {
      ...task,
      assignee: id,
    });
    contacts.onFalse()
  }
  const renderAssignee = (
    <Stack direction="row">
      <StyledLabel sx={{ height: 40, lineHeight: '40px' }}>Assignee</StyledLabel>

      <Stack direction="row" flexWrap="wrap" alignItems="center" spacing={1}>

        {assignee ? <Avatar
          src={assignee?.url}
          alt={assignee?.fullname}
          onClick={contacts.onTrue}
          sx={{
            width: 36,
            height: 36,
            border: (theme) => `solid 2px ${theme.palette.background.default}`,
            fontSize: "0.75rem",
            cursor: "pointer"
          }}
        >
          {assignee?.first_name?.charAt(0).toUpperCase()} {assignee?.last_name?.charAt(0).toUpperCase()}
        </Avatar>
          :
          <Tooltip title="Add assignee">
            <IconButton
              onClick={contacts.onTrue}
              sx={{
                bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
                border: (theme) => `dashed 1px ${theme.palette.divider}`,
              }}
            >
              <Iconify icon="mingcute:add-line" />
            </IconButton>
          </Tooltip>}

        <KanbanContactsDialog
          assignee={[assignee]}
          open={contacts.value}
          onClose={handleDialogClose}
          onCancel={contacts.onFalse}
          userList={userList}
        />
      </Stack>
    </Stack>
  );

  const renderDueDate = (
    <Stack direction="row" alignItems="center">
      <StyledLabel> Due date </StyledLabel>

      <DatePicker
        value={new Date(task.due_date)}
        onChange={(newValue) => {
          handleDateChange(newValue);
        }}
        format="dd/MM/yyyy"
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
      <KanbanDetailsPriority priority={task.priority} onChangePriority={handleChangePriority} />
    </Stack>
  );

  const renderDescription = (
    <>
      <Stack direction="column">
        <StyledLabel> Description </StyledLabel>
        <Editor id="full-editor" value={quillFull} onChange={(value) => setQuillFull(value)} />
        <Button variant="text" onClick={handleSaveDescription}>Save Description</Button>
      </Stack>
    </>
  );

  const renderAttachments = (
    <Stack direction="row">
      <StyledLabel>Attachments</StyledLabel>
      <KanbanDetailsAttachments attachments={task.attachments} />
    </Stack>
  );

  const renderComments = <KanbanDetailsCommentList comments={task.comments} userList={userList} />;

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
            justifyItems: "center"
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

          {renderAssignee}

          {renderDueDate}

          {renderPriority}

          {renderDescription}
        </Stack>

        {!!task.comments.length && renderComments}
      </Scrollbar>

      <KanbanDetailsCommentInput task={task} onUpdateTask={onUpdateTask} handleAddComment={handleAddComment}
      />
    </Drawer>
  );
}
