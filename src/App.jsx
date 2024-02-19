import "./App.css";
import { useState } from "react";
import DAMUploader from "./DAMUploader";
import DAMImage from "./DAMImage";
import DAMVideo from "./DAMVideo";
import DAMAudio from "./DAMAudio";

function App() {
  const [imageUrl, setImageUrl] = useState(
    "https://upcdn.io/kW15bg4/raw/wynter/4koure8XJF-wynterjones_a_fish_eye_lense_effect_of_door_eye_hole_looking_ou_8ef1f4fc-3d91-4c5c-b627-9d7b6b0c6979.png"
  );

  return (
    <>
      <h1>DAM Uploader</h1>

      <DAMUploader
        types={["audio", "video"]}
        callback={(files) => {
          // setImageUrl(files[0].fileUrl);
          console.log("Callback completed upload: ", files);
        }}
        callbackError={(msg) => {
          console.log(`Error: ${msg}`);
        }}
        label="Drag & Drop your files or <strong>Browse</strong>"
      />

      <DAMImage
        src={imageUrl}
        alt="My awesome image"
        className="App-logo"
        width="500"
        height="auto"
        lightbox={true}
      />

      <DAMVideo id="pQrB647VVKPOcl4zH7DabWMoaZstX02jQxs00dgtBDuVE" />
      <DAMAudio src="https://upcdn.io/kW15bg4/raw/wynter/4kouMhHV4e-Jack%20de%20Rippah.mp3" />
    </>
  );
}

export default App;
