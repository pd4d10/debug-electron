import { useDispatch, useSelector } from "./store";
import {
  Tabs,
  Tab,
  Divider,
  Pre,
  Tag,
  HTMLTable,
  Button,
} from "@blueprintjs/core";
import { useEffect, type FC, useState } from "react";

export const Session: FC = () => {
  const [activeId, setActiveId] = useState("");
  const dispatch = useDispatch();
  // const appState = useSelector((s) => s.app);
  const sessionState = useSelector((s) => s.session);

  useEffect(() => {
    const sessionIds = Object.keys(sessionState);

    // Ensure there always be one tab active
    if (!sessionIds.includes(activeId) && sessionIds[0]) {
      setActiveId(sessionIds[0]);
    }
  }, [activeId, sessionState]);

  return (
    <Tabs
      vertical
      selectedTabId={activeId}
      onChange={(key) => {
        setActiveId(key as string);
      }}
    >
      {Object.entries(sessionState).map(([id, session]) => {
        // const appInfo = appState.info[session.appId];

        return (
          <Tab
            id={id}
            key={id}
            // title={`${appInfo?.name} (${appInfo?.id})`}
            title="session" // TODO:
            panel={
              <div style={{ display: "flex", marginTop: -20 }}>
                <div>
                  <h3>Sessions (Click to open)</h3>
                  <HTMLTable compact interactive>
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Title</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(session.page).map(([id, page]) => (
                        <tr key={id}>
                          <td>
                            <Tag
                              intent={
                                page.type === "node"
                                  ? "success"
                                  : page.type === "page"
                                    ? "primary"
                                    : "none"
                              }
                            >
                              {page.type}
                            </Tag>
                          </td>
                          <td
                            style={{
                              maxWidth: 200,
                              wordWrap: "break-word",
                            }}
                          >
                            {page.title}
                          </td>
                          <td>
                            <Button
                              small
                              rightIcon="share"
                              onClick={() => {
                                const url = page.devtoolsFrontendUrl
                                  .replace(
                                    /^\/devtools/,
                                    "devtools://devtools/bundled",
                                  )
                                  .replace(
                                    /^chrome-devtools:\/\//,
                                    "devtools://",
                                  );

                                require("electron").ipcRenderer.send(
                                  "open-window",
                                  url,
                                );
                              }}
                            >
                              Inspect
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </HTMLTable>
                </div>
                <Divider />
                <Pre
                  style={{
                    flexGrow: 1,
                    overflow: "auto",
                    userSelect: "text",
                    fontFamily:
                      "SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace",
                  }}
                >
                  {session.log}
                </Pre>
              </div>
            }
          />
        );
      })}
    </Tabs>
  );
};
