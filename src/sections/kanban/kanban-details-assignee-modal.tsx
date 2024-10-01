import { useEffect, useState } from 'react';
import {
  Stack,
  Avatar,
  IconButton,
  Tooltip,
  Modal,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import Iconify from 'src/components/iconify';
import { StyledLabel } from '../../sections/kanban/kanban-details';
import axiosInstance from 'src/utils/axios';
import { IKanbanAssignee } from 'src/types/kanban';

type TaskAssigneeProps = {
  taskId: string;
  assignedUsers: IKanbanAssignee[];
  onUpdateAssignees: (updatedAssignees: IKanbanAssignee[]) => void;
}
export default function TaskAssignee({ taskId, assignedUsers, onUpdateAssignees }: TaskAssigneeProps) {
  const [open, setOpen] = useState(false);
  const [userList, setUserList] = useState([]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const getAll = async () => {
    const typeFilter = `&type=admin`;
    const { data } = await axiosInstance.get(`/users/?${typeFilter}`);
    setUserList(data || []);
  };
  console.log(userList);
  useEffect(() => {
    getAll();
  }, []);

  useEffect(() => {
    localStorage.setItem(`assignedUsers_${taskId}`, JSON.stringify(assignedUsers));
  }, [assignedUsers, taskId]);

  const handleRemoveUser = (userId) => {
    const updatedAssignees = assignedUsers.filter((user) => user.id !== userId);
    onUpdateAssignees(updatedAssignees);
  };

  const handleAssignUser = (employee) => {
    if (!assignedUsers.some((user) => user.id === employee.id)) {
      const updatedAssignees = [...assignedUsers, employee];
      onUpdateAssignees(updatedAssignees);
    }
    handleClose();
  };

  const renderAssignee = (
    <Stack direction="row">
      <StyledLabel sx={{ height: 40, lineHeight: '40px' }}>Assignee</StyledLabel>

      <Stack direction="row" flexWrap="wrap" alignItems="center" spacing={1}>
        {assignedUsers?.map((user) => (
          <Box key={user.id} sx={{ position: 'relative', display: 'inline-block' }}>
            <Tooltip title={user.fullname}>
              <Avatar alt={user.fullname} src={user.avatarUrl}  />
            </Tooltip>
            <IconButton
              size="small"
              onClick={() => handleRemoveUser(user.id)}
              sx={{
                position: 'absolute',
                top: -4,
                right: -4,
                width: 20,
                height: 20,
                bgcolor: 'background.paper',
                border: (theme) => `1px solid ${theme.palette.divider}`,
                '&:hover': {
                  bgcolor: 'error.main',
                  color: 'white',
                },
              }}
            >
              <Iconify icon="eva:close-outline" width={12} height={12} />
            </IconButton>
          </Box>
        ))}
        <Tooltip title="Add assignee">
          <IconButton
            onClick={handleOpen}
            sx={{
              bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
              border: (theme) => `dashed 1px ${theme.palette.divider}`,
            }}
          >
            <Iconify icon="mingcute:add-line" />
          </IconButton>
        </Tooltip>
      </Stack>

      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            maxHeight: '80vh',
            overflowY: 'auto',
            width: 400,
          }}
        >
          <h2>Assign a Person</h2>
          <List>
            {userList?.map((employee) => (
              <ListItem key={employee.id} button onClick={() => handleAssignUser(employee)}>
                <ListItemAvatar>
                  <Avatar alt={employee.fullname} src={employee.avatarUrl} />
                </ListItemAvatar>
                <ListItemText primary={employee.fullname} sx={{ display: 'inline-block', marginLeft: 1 }} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Modal>
    </Stack>
  );

  return renderAssignee;
}