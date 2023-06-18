// @ts-nocheck
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
  const [generatingPreview, setGeneratingPreview] = React.useState(false);
  const [pictureBook, setPictureBook] = React.useState([]);
  const [generatingPictureBook, setGeneratingPictureBook] =
    React.useState(false);

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

  const handleGenerate = async () => {
    setGeneratingPictureBook(true);
    setPictureBook([]);
    result?.content.map(async (item, idx) => {
      const res = await generateImage(item.imagePrompt);
      setPictureBook((prev) => [...prev, res?.[0]]);
      if (idx === result?.content.length - 1) {
        setGeneratingPictureBook(false);
      }
    });
  };

  React.useEffect(() => {
    (async () => {
      if (result?.content?.[0]?.imagePrompt) {
        setGeneratingPreview(true);
        const res = await generateImage(result?.content[0].imagePrompt);

        if (res?.[0]) {
          setPreview(res?.[0]);
          setGeneratingPreview(false);
        }
      }
    })();
  }, [result]);

  return (
    <main className="flex min-h-screen flex-col items-center p-24 gap-y-8 ">
      <div className="flex flex-col gap-y-4 w-[500px] items-center">
        <input
          type="text"
          placeholder="Please input a name"
          className="input w-full  input-bordered"
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Some descriptions (Optional)"
          className="input w-full  input-bordered"
        />
        <button className="btn w-[300px] mt-8" onClick={writeStory}>
          Write a story
        </button>
      </div>
      <div className="w-[500px]">
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
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {generatingPreview && <p>Generating preview...</p>}
      {preview && (
        <div className="flex flex-col items-center">
          <div className="mb-4">
            <p className="font-black text-lg">Preview</p>
          </div>
          <img
            src={preview}
            width={500}
            height={400}
            alt="preview"
            className="rounded-xl"
          />
          <div className="flex gap-x-8 mt-4">
            <div className="flex gap-x-4">
              <input
                type="radio"
                name="radio-1"
                className="radio"
                defaultChecked
              />
              <p>Style 1</p>
            </div>
            <div className="flex gap-x-4">
              <input type="radio" name="radio-1" className="radio" />
              <p>Style 2</p>
            </div>
            <div className="flex gap-x-4">
              <input type="radio" name="radio-1" className="radio" />
              <p>Style 3</p>
            </div>
          </div>
          <div className="flex flex-col gap-y-4 items-center mt-8">
            <button className="btn btn-primary" onClick={handleGenerate}>
              Generate A Picture Book
            </button>
            {generatingPictureBook && <p>Generating Picture Book...</p>}
            {pictureBook.length > 0 && (
              <ul className="grid grid-rows-2 grid-cols-2 gap-x-2 gap-y-8 mt-4">
                {pictureBook.map((item, idx) => (
                  <li
                    className="relative border border-black p-4 rounded-xl"
                    key={idx}
                  >
                    <p
                      className=" 
		    p-2 rounded-xl whitespace-wrap w-[500px] h-[50px] mb-4"
                    >
                      {result.content[idx].sentence}
                    </p>
                    <img
                      src={item}
                      width={500}
                      height={500}
                      alt="preview"
                      className="rounded-xl"
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
