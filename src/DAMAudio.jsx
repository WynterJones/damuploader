import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";

export default function DAMAudio({ src }) {
  return (
    <AudioPlayer
      autoPlay
      src={src}
      onPlay={(e) => console.log("onPlay")}
      // other props here
    />
  );
}
