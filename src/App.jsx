import "./App.css";
import DAMUploader from "./DAMUploader";

function App() {
  const completed = (url) => {
    console.log("Completed upload: ", url);
  };

  const error = (msg) => {
    console.error(`Error: ${msg}`);
  };

  return (
    <>
      <h1>DAM Uploader</h1>

      <DAMUploader
        callback={(url) => {
          completed(url);
        }}
        error={(msg) => {
          error(msg);
        }}
        label={
          'Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
        }
      />
    </>
  );
}

export default App;
