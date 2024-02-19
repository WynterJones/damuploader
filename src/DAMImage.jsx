import { UrlBuilder } from "@bytescale/sdk";
import { useImage } from "react-image";
import { Suspense } from "react";
import { useState } from "react";

const DAMImage = ({
  src,
  alt = "Image hosted by SuperGrid.com",
  width = 250,
  height = 250,
  className,
  lightbox = false,
}) => {
  const bytescaleTransform = (src) => {
    if (!src) {
      return src;
    }

    const apiKey = "public_kW15bg4CD9NgVAiipcNKZ5LZCTHD";
    const accountId = "kW15bg4";
    let filePath = src.split(`https://upcdn.io/${accountId}/raw`)[1];

    if (!filePath) {
      return src;
    }

    filePath = decodeURIComponent(filePath);

    const transformedUrl = UrlBuilder.url({
      apiKey: apiKey,
      accountId: accountId,
      filePath: filePath,
      options: {
        transformation: "image",
        transformationParams: {
          w: width,
          h: height,
        },
      },
    });

    return transformedUrl;
  };

  const transformedImageUrl = bytescaleTransform(src);

  function Image() {
    const [openLightbox, setOpenLightbox] = useState(false);

    const { src } = useImage({
      srcList: transformedImageUrl,
    });

    return (
      <>
        <img
          loading="lazy"
          src={src}
          alt={alt}
          width={width}
          height={height}
          style={{
            cursor: lightbox ? "pointer" : "",
          }}
          className={className}
          onClick={() => {
            lightbox && setOpenLightbox(true);
          }}
        />

        {lightbox && openLightbox && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100vh",
              background: "rgba(0,0,0,0.3)",
              display: "flex",
            }}
          >
            <img
              src={src}
              alt={alt}
              style={{
                maxWidth: "80%",
                height: "80%",
                margin: "auto",
                cursor: "pointer",
                boxShadow: "0 0 10px 0 rgba(0,0,0,0.3)",
              }}
              onClick={() => {
                setOpenLightbox(false);
              }}
            />
          </div>
        )}
      </>
    );
  }

  return (
    <Suspense>
      <Image />
    </Suspense>
  );
};

export default DAMImage;
