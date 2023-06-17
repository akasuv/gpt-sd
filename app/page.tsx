"use client";
import React from "react";
import Image from "next/image";

const ENDPOINT =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3004"
    : "https://paralll-server.fly.dev";

export default function Home() {
  const [isWriting, setIsWriting] = React.useState(false);
  const [result, setResult] = React.useState();
  const [name, setName] = React.useState("");
  const [preview, setPreview] = React.useState();

  const writeStory = async () => {
    setIsWriting(true);
    await fetch(`${ENDPOINT}/gpt?name=${name}`)
      .then((res) => res.json())
      .then((data) =>
        setResult(JSON.parse(data.choices?.[0]?.message.content).result)
      );
    setIsWriting(false);
  };

  const generateImage = async (prompt) => {
    return await fetch(`${ENDPOINT}/image?prompt=${prompt}`).then((res) =>
      res.json()
    );
  };

  React.useEffect(() => {
    (async () => {
      if (result?.content?.[0]?.imagePrompt) {
        console.log(result?.content[0].imagePrompt);
        const res = await generateImage(result?.content[0].imagePrompt);

        if (res.data?.[0]) {
          setPreview(res.data[0]["b64_json"]);
        }
      }
    })();
  }, [result]);

  return (
    <main className="flex min-h-screen flex-col items-center p-24 gap-y-8">
      <div className="flex flex-col gap-y-4 w-[300px]">
        <input
          type="text"
          placeholder="Please input a name"
          className="input w-full max-w-xs input-bordered"
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Some descriptions (Optional)"
          className="input w-full max-w-xs input-bordered"
        />
        <button className="btn" onClick={writeStory}>
          Write a story
        </button>
      </div>
      <div>
        {isWriting && <p>Writing...</p>}
        {/* {result && JSON.stringify(result)} */}
        {result && (
          <div>
            <p className="font-black text-lg">{result.title}</p>
            <ul className="flex flex-col gap-y-2 mt-4">
              {result.content.map((item, idx) => (
                <li className="flex flex-col">
                  <div className="flex">
                    <p className="w-[24px]">{idx + 1}.</p>
                    <p>{item.sentence}</p>
                  </div>
                  <div>
                    <p>[image prompt: {item.imagePrompt}]</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div>
        {preview && (
          <Image
            src={"data:image/png;base64," + preview}
            width={500}
            height={500}
            alt="preview"
          />
        )}
      </div>
    </main>
  );
}
