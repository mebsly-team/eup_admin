import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';

import { fToNow } from 'src/utils/format-time';

import Lightbox, { useLightBox } from 'src/components/lightbox';

import { IKanbanComment } from 'src/types/kanban';

// ----------------------------------------------------------------------

type Props = {
  comments: IKanbanComment[];
};

export default function KanbanDetailsCommentList({ comments }: Props) {
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
        {comments.map((comment) => (
          <Stack key={comment.id} direction="row" spacing={2}>
            <Avatar src={comment.avatarUrl} alt={comment.name} sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              {comment.name.charAt(0).toUpperCase()}
            </Avatar>
            
            <Stack spacing={0.5}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                  {fToNow(comment.createdAt)}
                </Typography>
              </Stack>
              <Typography variant="subtitle2">{comment.name}</Typography>


              <Typography variant="body2">{comment.message}</Typography>
            </Stack>
          </Stack>
        ))}
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
