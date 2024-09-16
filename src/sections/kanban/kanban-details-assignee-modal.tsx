import React, { useState } from 'react';
import { Stack, Avatar, IconButton, Tooltip, Modal, Box, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import { alpha } from '@mui/material/styles';
import Iconify from 'src/components/iconify'; // Eğer iconlar için Iconify kullanıyorsanız
import { StyledLabel } from '../../sections/kanban/kanban-details';




const personnelList = [
  { id: 1, name: 'John Doe', avatarUrl: 'https://randomuser.me/api/portraits/men/1.jpg' },
  { id: 2, name: 'Jane Smith', avatarUrl: 'https://randomuser.me/api/portraits/women/2.jpg' },
  // Diğer personeller...
];

export default function TaskAssignee() {
  const [open, setOpen] = useState(false); // Modal'ı kontrol etmek için state

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const renderAssignee = (
    <Stack direction="row">
      <StyledLabel sx={{ height: 40, lineHeight: '40px' }}>Assignee</StyledLabel>

      <Stack direction="row" flexWrap="wrap" alignItems="center" spacing={1}>
        {/* Assignee'leri burada gösterebilirsiniz */}
        {/* {task.assignee.map((user) => (
          <Avatar key={user.id} alt={user.name} src={user.name} />
        ))} */}

        <Tooltip title="Add assignee">
          <IconButton
            onClick={handleOpen} // Personel listesini açar
            sx={{
              bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
              border: (theme) => `dashed 1px ${theme.palette.divider}`,
            }}
          >
            <Iconify icon="mingcute:add-line" />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Modal - Personel listesi */}
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
            {personnelList.map((user) => (
              <ListItem key={user.id} button onClick={() => console.log(`Assigned: ${user.name}`)}>
                <ListItemAvatar>
                  <Avatar alt={user.name} src={user.avatarUrl} />
                </ListItemAvatar>
                <ListItemText primary={user.name} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Modal>
    </Stack>
  );

  return renderAssignee;
}