"use client";
import { useEffect, useRef, useState } from "react";
import { COLORS, ColorName, ContentItem, TerminalLine } from "./types";
import "./terminal.css";

interface TerminalProps {
  lines: TerminalLine[];
}

const Terminal = ({ lines }: TerminalProps) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const isFullscreenRef = useRef(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const activeProgressElements = useRef<
    { element: HTMLElement; progress: number }[]
  >([]);
  const isPausedRef = useRef(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      isPausedRef.current = document.hidden;
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => setIsVisible(false), 300);
  };

  const handleFullscreen = () => {
    isFullscreenRef.current = !isFullscreenRef.current;
    setIsFullscreen(isFullscreenRef.current);

    // Wait for the transition to complete before recalculating widths
    setTimeout(() => {
      if (terminalRef.current) {
        const width = terminalRef.current.clientWidth;
        activeProgressElements.current.forEach(({ element, progress }) => {
          // More conservative padding in fullscreen mode
          const padding = isFullscreenRef.current ? 120 : 45;
          const availableChars = Math.floor((width - padding) / 9);
          const fixedChars = 7;
          const safetyMargin = 4;
          const availableWidth = Math.max(
            0,
            availableChars - fixedChars - safetyMargin
          );
          const filledWidth = Math.floor(availableWidth * (progress / 100));
          const emptyWidth = availableWidth - filledWidth;

          element.textContent = `[${progress
            .toString()
            .padStart(3)}%] ${"█".repeat(Math.max(0, filledWidth))}${" ".repeat(
            Math.max(0, emptyWidth)
          )}`;
        });

        // Scroll to bottom after redrawing
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      }
    }, 1000);
  };

  const getColorValue = (color: ColorName | string | undefined): string => {
    if (!color) return "";
    return (COLORS as Record<string, string>)[color] || color;
  };

  useEffect(() => {
    const typeText = async (
      element: HTMLElement,
      content: ContentItem,
      charDelay = 50,
      cursorElement?: HTMLElement,
      deleteAfter = false,
      defaultDeleteDelay = 50
    ) => {
      // Convert content to array of ColoredText
      const items = Array.isArray(content)
        ? content
        : [typeof content === "string" ? { text: content } : content];

      let currentText = "";
      let currentHtml = "";
      const fullText = items
        .map((item) => (typeof item === "string" ? item : item.text))
        .join("");

      for (const char of fullText) {
        // Wait while paused
        while (isPausedRef.current) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        currentText += char;

        // Find which colored segment this character belongs to
        let processedChars = 0;
        currentHtml = items
          .map((item) => {
            const itemText = typeof item === "string" ? item : item.text;
            const itemColor = typeof item === "string" ? undefined : item.color;
            const itemHref = typeof item === "string" ? undefined : item.href;

            if (processedChars + itemText.length <= currentText.length) {
              // This segment is fully typed
              processedChars += itemText.length;
              const colorStyle = itemColor
                ? `color: ${getColorValue(itemColor)};`
                : "";
              const cursorStyle = itemHref ? "cursor: pointer;" : "";
              const style = colorStyle + cursorStyle;
              return itemHref
                ? `<a href="${itemHref}" target="_blank" rel="noopener noreferrer" style="${style}">${itemText}</a>`
                : itemColor
                ? `<span style="${style}">${itemText}</span>`
                : itemText;
            } else if (processedChars < currentText.length) {
              // This segment is partially typed
              const partialText = itemText.slice(
                0,
                currentText.length - processedChars
              );
              processedChars += partialText.length;
              const colorStyle = itemColor
                ? `color: ${getColorValue(itemColor)};`
                : "";
              const cursorStyle = itemHref ? "cursor: pointer;" : "";
              const style = colorStyle + cursorStyle;
              return itemHref
                ? `<a href="${itemHref}" target="_blank" rel="noopener noreferrer" style="${style}">${partialText}</a>`
                : itemColor
                ? `<span style="${style}">${partialText}</span>`
                : partialText;
            }
            return "";
          })
          .join("");

        element.innerHTML = currentHtml;
        if (cursorElement) {
          element.appendChild(cursorElement);
        }
        await new Promise((resolve) => setTimeout(resolve, charDelay));
      }

      if (deleteAfter) {
        // Find the maximum deleteDelay among all items
        const maxDeleteDelay = Math.max(
          1000, // Base delay of 1 second
          ...items.map((item) =>
            typeof item === "string" ? 0 : item.deleteDelay || 0
          )
        );

        // Wait for the maximum delay before starting deletion
        await new Promise((resolve) => setTimeout(resolve, maxDeleteDelay));

        while (currentText.length > 0) {
          // Wait while paused
          while (isPausedRef.current) {
            await new Promise((resolve) => setTimeout(resolve, 100));
          }

          currentText = currentText.slice(0, -1);

          // Recalculate colored segments
          let processedChars = 0;
          currentHtml = items
            .map((item) => {
              const itemText = typeof item === "string" ? item : item.text;
              const itemColor =
                typeof item === "string" ? undefined : item.color;
              const itemHref = typeof item === "string" ? undefined : item.href;

              if (processedChars + itemText.length <= currentText.length) {
                processedChars += itemText.length;
                const colorStyle = itemColor
                  ? `color: ${getColorValue(itemColor)};`
                  : "";
                const cursorStyle = itemHref ? "cursor: pointer;" : "";
                const style = colorStyle + cursorStyle;
                return itemHref
                  ? `<a href="${itemHref}" target="_blank" rel="noopener noreferrer" style="${style}">${itemText}</a>`
                  : itemColor
                  ? `<span style="${style}">${itemText}</span>`
                  : itemText;
              } else if (processedChars < currentText.length) {
                const partialText = itemText.slice(
                  0,
                  currentText.length - processedChars
                );
                processedChars += partialText.length;
                const colorStyle = itemColor
                  ? `color: ${getColorValue(itemColor)};`
                  : "";
                const cursorStyle = itemHref ? "cursor: pointer;" : "";
                const style = colorStyle + cursorStyle;
                return itemHref
                  ? `<a href="${itemHref}" target="_blank" rel="noopener noreferrer" style="${style}">${partialText}</a>`
                  : itemColor
                  ? `<span style="${style}">${partialText}</span>`
                  : partialText;
              }
              return "";
            })
            .join("");

          element.innerHTML = currentHtml;
          if (cursorElement) {
            element.appendChild(cursorElement);
          }
          await new Promise((resolve) =>
            setTimeout(resolve, defaultDeleteDelay)
          );
        }
      }
    };

    const animateProgress = async (element: HTMLElement, duration = 2000) => {
      const getProgressBar = (progress: number) => {
        if (!terminalRef.current) return "";

        const width = terminalRef.current.clientWidth;
        const padding = isFullscreenRef.current ? 120 : 45;
        const availableChars = Math.floor((width - padding) / 9);
        const fixedChars = 7;
        const safetyMargin = 4;
        const availableWidth = Math.max(
          0,
          availableChars - fixedChars - safetyMargin
        );
        const filledWidth = Math.floor(availableWidth * (progress / 100));
        const emptyWidth = availableWidth - filledWidth;

        return `[${progress.toString().padStart(3)}%] ${"█".repeat(
          Math.max(0, filledWidth)
        )}${" ".repeat(Math.max(0, emptyWidth))}`;
      };

      element.className = "terminal-line progress-line";
      const steps = 20;
      const stepDuration = duration / steps;

      activeProgressElements.current.push({
        element,
        progress: 0,
      });

      for (let i = 0; i <= steps; i++) {
        // Wait while paused
        while (isPausedRef.current) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        const currentProgress = Math.floor((i / steps) * 100);
        element.textContent = getProgressBar(currentProgress);

        const existingIndex = activeProgressElements.current.findIndex(
          (item) => item.element === element
        );

        if (existingIndex >= 0) {
          activeProgressElements.current[existingIndex].progress =
            currentProgress;
        }

        await new Promise((resolve) => setTimeout(resolve, stepDuration));
      }
    };

    const animatePercentages = async (
      element: HTMLElement,
      text: string,
      percentages: { start: number; end: number; duration?: number }[]
    ) => {
      const steps = 20;
      const durations = percentages.map((p) => p.duration || 2000);
      const stepDuration = Math.min(...durations) / steps;

      // Remove ", done." from text for animation
      const baseText = text.replace(/, done\.$/, "");

      // Find all patterns including network speed
      const speedPattern = /(\d+(?:\.\d+)?)\s*MiB\/s/;
      const speedMatch = baseText.match(speedPattern);

      // Find numbers in specific patterns:
      // 1. Number followed by %
      // 2. Number inside parentheses (n/total)
      // 3. Number before MiB
      const patterns = [
        /(\d+)%/, // Matches "n%"
        /\((\d+)\/\d+\)/, // Matches "(n/total)"
        /(\d+(?:\.\d+)?)\s*MiB(?!\/)/, // Matches "n.nn MiB" not followed by "/"
      ];

      const matches = percentages.map((_, index) => {
        const pattern = patterns[index];
        if (!pattern) return null;

        const match = baseText.match(pattern);
        if (!match) return null;

        return {
          value: match[1],
          index: match.index! + match[0].indexOf(match[1]),
          length: match[1].length,
          hasDecimal: match[1].includes("."),
          isSpeed: false,
        };
      });

      // Add speed match if found
      const allMatches = speedMatch
        ? [
            ...matches,
            {
              value: speedMatch[1],
              index: speedMatch.index! + speedMatch[0].indexOf(speedMatch[1]),
              length: speedMatch[1].length,
              hasDecimal: true,
              isSpeed: true,
            },
          ]
        : matches;

      if (matches.some((match) => match === null)) {
        console.warn(
          "Could not find all patterns in text:",
          matches,
          "in text:",
          baseText
        );
        return;
      }

      for (let step = 0; step <= steps; step++) {
        // Wait while paused
        while (isPausedRef.current) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        let newText = baseText;
        // Replace each number with its current value, starting from the end
        for (let i = allMatches.length - 1; i >= 0; i--) {
          const match = allMatches[i];
          if (!match) continue;

          let currentValue: number;

          if (match.isSpeed) {
            // For network speed, generate a random value that increases with progress
            const minSpeed = 0;
            const maxSpeed = 10;
            const speedRange = maxSpeed - minSpeed;
            const minCurrentSpeed =
              minSpeed + speedRange * (step / steps) * 0.8;
            const maxCurrentSpeed = Math.min(
              maxSpeed,
              minCurrentSpeed + speedRange * 0.2
            );
            currentValue =
              minCurrentSpeed +
              Math.random() * (maxCurrentSpeed - minCurrentSpeed);
          } else {
            const { start, end } = percentages[i];
            currentValue = start + (end - start) * (step / steps);
          }

          const formattedValue =
            match.hasDecimal || match.isSpeed
              ? currentValue.toFixed(2).padStart(match.length, "0")
              : Math.floor(currentValue).toString().padStart(match.length, " ");

          newText =
            newText.slice(0, match.index) +
            formattedValue +
            newText.slice(match.index + match.length);
        }

        // Add ", done." only on the last step
        if (step === steps) {
          newText += ", done.";
        }

        element.textContent = newText;
        await new Promise((resolve) => setTimeout(resolve, stepDuration));
      }
    };

    const typeLines = async () => {
      const scrollToBottom = () => {
        if (terminalRef.current) {
          terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
      };

      // Create cursor element
      const cursorElement = document.createElement("span");
      cursorElement.className = "terminal-cursor blinking"; // Start with blinking
      terminalRef.current?.appendChild(cursorElement);
      scrollToBottom();

      for (const line of lines) {
        const lineElement = document.createElement("div");
        lineElement.className = "terminal-line";

        if (line.type === "input" || line.type === "disappearing-input") {
          const promptSpan = document.createElement("span");
          promptSpan.className = "prompt";
          promptSpan.textContent = line.prompt || "▲";
          lineElement.appendChild(promptSpan);

          const contentSpan = document.createElement("span");
          contentSpan.className = "content";
          lineElement.appendChild(contentSpan);

          // Handle array of content for disappearing-input
          const contents = Array.isArray(line.content)
            ? line.content
            : [line.content];

          // For empty content, just add a space and the cursor
          if (contents.length === 0) {
            contentSpan.textContent = " ";
            contentSpan.appendChild(cursorElement);
            terminalRef.current?.appendChild(lineElement);
            scrollToBottom();

            // Wait for typeDelay if specified
            if (line.typeDelay) {
              await new Promise((resolve) =>
                setTimeout(resolve, line.typeDelay)
              );
            }
          } else {
            contentSpan.appendChild(cursorElement);
            terminalRef.current?.appendChild(lineElement);
            scrollToBottom();

            // Wait for typeDelay if specified
            if (line.typeDelay) {
              await new Promise((resolve) =>
                setTimeout(resolve, line.typeDelay)
              );
            }

            await new Promise((resolve) => setTimeout(resolve, 300));

            for (let i = 0; i < contents.length; i++) {
              const content = contents[i];
              const isLast = i === contents.length - 1;
              const shouldDelete =
                line.type === "disappearing-input" && !isLast;

              await typeText(
                contentSpan,
                content,
                line.charDelay,
                cursorElement,
                shouldDelete,
                line.deleteDelay
              );
            }
            scrollToBottom();
          }

          // Wait for finishDelay if specified
          if (line.finishDelay) {
            await new Promise((resolve) =>
              setTimeout(resolve, line.finishDelay)
            );
          }
        } else if (line.type === "progress") {
          // For non-input lines, wait for typeDelay first
          await new Promise((resolve) =>
            setTimeout(resolve, line.typeDelay || 200)
          );

          cursorElement.remove();
          terminalRef.current?.appendChild(lineElement);
          scrollToBottom();
          await animateProgress(lineElement, line.progressDuration);
          terminalRef.current?.appendChild(cursorElement);
          scrollToBottom();

          // Wait for finishDelay if specified
          if (line.finishDelay) {
            await new Promise((resolve) =>
              setTimeout(resolve, line.finishDelay)
            );
          }
        } else if (line.type === "percentage-output") {
          // For non-input lines, wait for typeDelay first
          await new Promise((resolve) =>
            setTimeout(resolve, line.typeDelay || 200)
          );

          cursorElement.remove();
          terminalRef.current?.appendChild(lineElement);

          if (line.percentages && typeof line.content === "string") {
            await animatePercentages(
              lineElement,
              line.content,
              line.percentages
            );
          }

          terminalRef.current?.appendChild(cursorElement);
          scrollToBottom();

          // Wait for finishDelay if specified
          if (line.finishDelay) {
            await new Promise((resolve) =>
              setTimeout(resolve, line.finishDelay)
            );
          }
        } else {
          // For output lines, handle multi-line content
          const contentArray = Array.isArray(line.content)
            ? line.content
            : [line.content];

          const contentHtml = contentArray
            .map((item) => {
              if (Array.isArray(item)) {
                return item
                  .map((subItem) => {
                    if (typeof subItem === "string") {
                      return subItem;
                    }
                    const colorStyle = subItem.color
                      ? `color: ${getColorValue(subItem.color)};`
                      : "";
                    const cursorStyle = subItem.href ? "cursor: pointer;" : "";
                    const style = colorStyle + cursorStyle;
                    return subItem.href
                      ? `<a href="${subItem.href}" target="_blank" rel="noopener noreferrer" style="${style}">${subItem.text}</a>`
                      : `<span style="${style}">${subItem.text}</span>`;
                  })
                  .join("");
              }
              if (typeof item === "string") {
                return item;
              }
              const colorStyle = item.color
                ? `color: ${getColorValue(item.color)};`
                : "";
              const cursorStyle = item.href ? "cursor: pointer;" : "";
              const style = colorStyle + cursorStyle;
              return item.href
                ? `<a href="${item.href}" target="_blank" rel="noopener noreferrer" style="${style}">${item.text}</a>`
                : `<span style="${style}">${item.text}</span>`;
            })
            .join("\n");

          if (contentHtml.includes("\n")) {
            lineElement.innerHTML = contentHtml.replace(/\n/g, "<br>");
          } else {
            lineElement.innerHTML = contentHtml;
          }

          cursorElement.remove();
          terminalRef.current?.appendChild(lineElement);
          terminalRef.current?.appendChild(cursorElement);
          scrollToBottom();

          // Wait for finishDelay if specified
          if (line.finishDelay) {
            await new Promise((resolve) =>
              setTimeout(resolve, line.finishDelay)
            );
          }
        }
      }
    };

    typeLines();
  }, [lines]);

  if (!isVisible) return null;

  return (
    <div
      className={`terminal-container ${isMinimized ? "minimized" : ""} ${
        isFullscreen ? "fullscreen" : ""
      } ${isClosing ? "closing" : ""}`}
    >
      <div className="terminal-header">
        <div className="terminal-buttons">
          <div
            className="terminal-button close"
            onClick={handleClose}
            title="Close"
          />
          <div
            className="terminal-button minimize"
            onClick={() => setIsMinimized(!isMinimized)}
            title="Minimize"
          />
          <div
            className="terminal-button maximize"
            onClick={handleFullscreen}
            title="Toggle full screen"
          />
        </div>
      </div>
      <div className="terminal" ref={terminalRef} />
    </div>
  );
};

export default Terminal;
