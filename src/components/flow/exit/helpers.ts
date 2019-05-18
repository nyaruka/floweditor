import { Exit } from "flowTypes";

export const getExitActivityKey = (exit: Exit) => {
  return exit.uuid + ":" + exit.destination_uuid;
};
