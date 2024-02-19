import MuxPlayer from "@mux/mux-player-react/lazy";

export default function DAMVIideo({ id }) {
  return (
    <MuxPlayer
      streamType="on-demand"
      playbackId={id}
      metadataVideoTitle="Placeholder (optional)"
      metadataViewerUserId="Placeholder (optional)"
      primaryColor="#FFFFFF"
      secondaryColor="#000000"
    />
  );
}
