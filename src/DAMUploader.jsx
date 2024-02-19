import { useState } from "react";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";

registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

function DAMUploader({ callback, callbackError, label, types }) {
  const [pond, setPond] = useState(null);
  const [dynamicLabel, setDynamicLabel] = useState(label);

  const processMux = (file) => {
    const MUX_TOKEN_ID = "c49fdcf0-8a88-48d4-b309-755819050762";
    const MUX_TOKEN_SECRET =
      "E/T7eqoIyw+JDozVW+0EupiGIoJjG1fWelSPETE6eOGOF7swivFb05905fbhzunpa6Anv6AYBXo";

    const url = "https://api.mux.com/video/v1/assets";
    const data = {
      input: file,
      playback_policy: ["public"],
    };

    let request = new XMLHttpRequest();
    request.open("POST", url, true);
    request.setRequestHeader("Content-Type", "application/json");
    request.setRequestHeader(
      "Authorization",
      "Basic " + btoa(MUX_TOKEN_ID + ":" + MUX_TOKEN_SECRET)
    );

    request.onload = function () {
      if (this.status >= 200 && this.status < 400) {
        console.log(JSON.parse(this.response));
      } else {
        console.error("Server returned an error");
      }
    };

    request.onerror = function () {
      console.error("Connection error");
    };

    request.send(JSON.stringify(data));
    return request;
  };

  const showError = (msg) => {
    setDynamicLabel(msg);
    setTimeout(() => {
      setDynamicLabel(label);
    }, 1300);
  };

  const processByteScale = (file) => {
    const baseUrl = "https://api.bytescale.com";
    const accountId = "kW15bg4";
    const path = `/v2/accounts/${accountId}/uploads/form_data`;
    const apiKey = "public_kW15bg4CD9NgVAiipcNKZ5LZCTHD";
    const query = {
      folderPath: "/wynter",
      tag: ["example_tag"],
    };

    let querystring = Object.entries(query)
      .flatMap(([key, value]) =>
        Array.isArray(value)
          ? value.map(
              (v) => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`
            )
          : `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
      )
      .join("&");

    let url = `${baseUrl}${path}?${querystring}`;

    const formData = new FormData();
    const hasExtension = /\.[0-9a-z]+$/i.test(file.name);
    const fileName = hasExtension
      ? file.name
      : `${file.name}.${file.type.split("/")[1]}`;
    formData.append("file", file, fileName);

    let request = new XMLHttpRequest();
    request.open("POST", url, true);
    request.setRequestHeader("Authorization", `Bearer ${apiKey}`);

    request.onreadystatechange = function () {
      if (request.readyState === 4) {
        if (request.status >= 200 && request.status < 300) {
          const data = JSON.parse(request.responseText);
          callback(data.files);
          console.log(`Success:`, data);

          if (file.type.includes("video") || file.type.includes("audio")) {
            processMux(data.files[0].fileUrl);
          }
        } else {
          callbackError(request.statusText);
          showError("Something went wrong...");
          console.error(`Error: ${request.statusText}`);
        }
      }
    };
    return request;
  };

  const serverUpload = (
    fieldName,
    file,
    metadata,
    load,
    error,
    progress,
    abort
  ) => {
    const formData = new FormData();
    formData.append(fieldName, file, file.name);

    let request = processByteScale(file);

    request.upload.onprogress = (e) => {
      progress(e.lengthComputable, e.loaded, e.total);
    };

    request.onload = function () {
      if (request.status >= 200 && request.status < 300) {
        load(request.responseText);
      } else {
        callbackError("Something went wrong...");
        showError("Something went wrong...");
      }
    };

    request.send(formData);

    return {
      abort: () => {
        request.abort();

        abort();
      },
    };
  };

  async function deleteFile(filePath) {
    const baseUrl = "https://api.bytescale.com";
    const accountId = "kW15bg4";
    const path = `/v2/accounts/${accountId}/files`;
    const apiKey = "secret_kW15bg48ppgCJe4rtd1ieJunF3Pc"; // using secret key for delete
    const entries = (obj) =>
      Object.entries(obj).filter(([, val]) => (val ?? null) !== null);
    const query = entries({
      filePath: "/uploads/" + filePath,
    })
      .flatMap(([k, v]) =>
        Array.isArray(v) ? v.map((v2) => [k, v2]) : [[k, v]]
      )
      .map((kv) => kv.join("="))
      .join("&");
    const response = await fetch(
      `${baseUrl}${path}${query.length > 0 ? "?" : ""}${query}`,
      {
        method: "DELETE",
        headers: Object.fromEntries(
          entries({
            Authorization: `Bearer ${apiKey}`,
          })
        ),
      }
    );
    if (Math.floor(response.status / 100) !== 2) {
      const result = await response.json();
      const errorMessage = JSON.stringify(result);
      callbackError(errorMessage);
      showError("Something went wrong...");
      throw new Error(`Bytescale API Error: ${errorMessage}`);
    }

    return response;
  }

  const revertFile = (uniqueFileId, load, error) => {
    const data = JSON.parse(uniqueFileId);
    const response = deleteFile(data.filePath);

    response.then(() => {
      load();
      callback("deleted");
    });
  };

  return (
    <FilePond
      name="damuploader"
      credits={false}
      ref={(ref) => setPond(ref)}
      labelIdle={dynamicLabel}
      allowMultiple={false}
      dropOnPage={true}
      dropValidation={true}
      server={{
        process: (
          fieldName,
          file,
          metadata,
          load,
          error,
          progress,
          abort,
          transfer,
          options
        ) => {
          if (types.includes(file.type.split("/")[0])) {
            return serverUpload(
              fieldName,
              file,
              metadata,
              load,
              error,
              progress,
              abort,
              transfer,
              options
            );
          } else {
            callbackError("Invalid file type.");
            abort();
            pond.removeFile();
            showError("Invalid file type.");
          }
        },
        revert: (uniqueFileId, load, error) => {
          revertFile(uniqueFileId, load, error);
        },
      }}
    />
  );
}

export default DAMUploader;
