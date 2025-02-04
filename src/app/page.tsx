"use client";
import Terminal from "@/components/Terminal/Terminal";
import { TerminalLine } from "@/components/Terminal/types";

export default function Home() {
  const terminalLines: TerminalLine[] = [
    {
      type: "input",
      content: "git clone https://github.com/fsegouin/segouin-me",
      prompt: "▲",
      charDelay: 50,
      finishDelay: 500,
      typeDelay: 2000,
    },
    {
      type: "output",
      content: "Cloning into 'segouin-me'...",
      finishDelay: 500,
    },
    {
      type: "percentage-output",
      content: "remote: Enumerating objects: 0, done.",
      percentages: [{ start: 0, end: 17788, duration: 1500 }],
      typeDelay: 0,
      finishDelay: 300,
    },
    {
      type: "percentage-output",
      content: "remote: Counting objects: 0% (0/55), done.",
      percentages: [
        { start: 0, end: 100, duration: 1200 },
        { start: 0, end: 55, duration: 1200 },
      ],
      typeDelay: 0,
      finishDelay: 300,
    },
    {
      type: "percentage-output",
      content: "remote: Compressing objects: 0% (0/46), done.",
      percentages: [
        { start: 0, end: 100, duration: 2000 },
        { start: 0, end: 46, duration: 2000 },
      ],
      typeDelay: 0,
      finishDelay: 1000,
    },
    {
      type: "output",
      content: "remote: Total 17788 (delta 31), reused 9 (delta 9), pack-reuse",
      finishDelay: 1000,
      typeDelay: 0,
    },
    {
      type: "percentage-output",
      content: "Receiving objects: 0% (0/17788), 0.00 MiB | 5.77 MiB/s",
      percentages: [
        { start: 0, end: 100, duration: 2000 },
        { start: 0, end: 17788, duration: 2000 },
        { start: 0, end: 27.09, duration: 2000 },
      ],
      typeDelay: 0,
      finishDelay: 1000,
    },
    {
      type: "percentage-output",
      content: "Resolving deltas: 100% (10422/10422), done.",
      percentages: [
        { start: 0, end: 100, duration: 2000 },
        { start: 0, end: 10422, duration: 2000 },
      ],
      typeDelay: 0,
      finishDelay: 1000,
    },
    {
      type: "input",
      content: "cd segouin-me && npm install",
      prompt: "▲",
      charDelay: 100,
      finishDelay: 500,
    },
    { type: "progress", content: "", progressDuration: 3000, finishDelay: 500 },
    {
      type: "input",
      content: "npm start",
      prompt: "▲ ~/segouin-me",
      charDelay: 100,
      finishDelay: 500,
    },
    {
      type: "output",
      content: "Are you sure you want to start 'segouin-me'?",
      finishDelay: 1000,
    },
    {
      type: "input",
      content: "y",
      prompt: "(y/n)",
      typeDelay: 3000,
      finishDelay: 2000,
    },
    {
      type: "disappearing-input",
      typeDelay: 2000,
      content: [
        [
          {
            text: "Welcome to my personal website.",
            color: "green",
            deleteDelay: 4000,
          },
        ],
        [
          { text: "I'm a software engineer and ", color: "blue" },
          { text: "design lover", color: "pink" },
          { text: " at heart.", color: "blue", deleteDelay: 3000 },
        ],
        [
          {
            text: "Checking availability...",
            color: "yellow",
            deleteDelay: 2000,
          },
        ],
        [{ text: "Error.", color: "red", deleteDelay: 4000 }],
        [
          { text: "I'm currently working full-time as a ", color: "blue" },
          { text: "creative development director", color: "purple" },
          { text: " at ", color: "blue" },
          {
            text: "AKQA",
            color: "pink",
            href: "https://www.akqa.com",
          },
          { text: ".", color: "blue", deleteDelay: 2500 },
        ],
        [
          {
            text: "However, if you think I could help you build your next big thing, please get in touch at ",
            color: "blue",
          },
          {
            text: "florent@segouin.me",
            color: "green",
            href: "mailto:florent@segouin.me",
          },
          { text: ".", color: "blue" },
        ],
      ],
      prompt: ">",
      charDelay: 50,
      deleteDelay: 30,
      finishDelay: 500,
    },
  ];

  return (
    <main className="min-h-screen">
      <Terminal lines={terminalLines} />
    </main>
  );
}
