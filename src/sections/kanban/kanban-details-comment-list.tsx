import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';

import { fToNow } from 'src/utils/format-time';

import Lightbox, { useLightBox } from 'src/components/lightbox';

import { IKanbanComment } from 'src/types/kanban';

// ----------------------------------------------------------------------

type Props = {
  comments: IKanbanComment[];
  userList: any[];
};

export default function KanbanDetailsCommentList({ comments, userList }: Props) {
  const slides = comments
    .filter((comment) => comment.messageType === 'image')
    .map((slide) => ({ src: slide.message }));

  const lightbox = useLightBox(slides);

  return (
    <>
      <Stack
        spacing={3}
        flexGrow={1}
        sx={{
          py: 3,
          px: 2.5,
          bgcolor: 'background.neutral',
        }}
      >
        {comments.map((comment) => {
          const commenter = userList.find(item => item.id === comment.commenter)
          return (
            <Stack key={comment.id} direction="row" spacing={2}>
              <Avatar
                src={commenter?.url}
                alt={commenter?.fullname}
                sx={{
                  width: 36,
                  height: 36,
                  border: (theme) => `solid 2px ${theme.palette.background.default}`,
                  fontSize: "0.75rem"
                }}
              >
                {commenter?.first_name?.charAt(0).toUpperCase()} {commenter?.last_name?.charAt(0).toUpperCase()}
              </Avatar>
              <Stack spacing={0.5}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                    {fToNow(comment.datetime)}
                  </Typography>
                </Stack>

                <Typography variant="body2">{comment.comment}</Typography>
              </Stack>
            </Stack>
          )
        })}
      </Stack>

      <Lightbox
        index={lightbox.selected}
        slides={slides}
        open={lightbox.open}
        close={lightbox.onClose}
      />
    </>
  );
}
