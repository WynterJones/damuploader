import { useState } from "react";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";

registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

function DAMUploader({ callback, error, label }) {
  const [pond, setPond] = useState(null);

  const processMux = (file) => {
    //  TODO: Implement Mux upload

    return request;
  };

  const processByteScale = (file) => {
    const baseUrl = "https://api.bytescale.com";
    const accountId = "kW15bg4";
    const path = `/v2/accounts/${accountId}/uploads/binary`;
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

    let request = new XMLHttpRequest();
    request.open("POST", url, true);
    request.setRequestHeader("Authorization", `Bearer ${apiKey}`);

    const formData = new FormData();
    formData.append("file", file, file.name);

    request.onreadystatechange = function () {
      if (request.readyState === 4) {
        if (request.status >= 200 && request.status < 300) {
          const data = JSON.parse(request.responseText);
          callback(data.fileUrl);
          console.log(`Success:`, data);
        } else {
          error(request.statusText);
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

    let request;

    if (file.type.includes("video") || file.type.includes("audio")) {
      request = processMux(file);
    } else {
      request = processByteScale(file);
    }

    request.upload.onprogress = (e) => {
      progress(e.lengthComputable, e.loaded, e.total);
    };

    request.onload = function () {
      if (request.status >= 200 && request.status < 300) {
        load(request.responseText);
      } else {
        error("Something went wrong when uploading the file.");
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
      error(JSON.stringify(result));
      throw new Error(`Bytescale API Error: ${JSON.stringify(result)}`);
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
      labelIdle={
        label ||
        'Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
      }
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
        },
        revert: (uniqueFileId, load, error) => {
          revertFile(uniqueFileId, load, error);
        },
      }}
    />
  );
}

export default DAMUploader;
