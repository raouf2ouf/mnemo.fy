import { v4 as uuid } from "uuid";
import { TaskColor, TaskType } from "./task/task.enums";
import { Sector, SectorDataExport, deflateSector } from "./task/sector";
import { Task } from "./task/task";

/**
 * Galaxy themes
 */
export enum GalaxyTheme {
  BTL = "BTL",
}

/**
 * Galaxy types
 */
export enum GalaxyCategory {
  PROJECT = "Project",
  NFT = "NFT",
}

/**
 * Galaxy save status
 */
export enum SaveStatus {
  NEED_TO_SAVE = "need-to-save",
  NO_COPY = "no-copy",
  AHEAD = "ahead",
  SAME = "same",
  BEHIND = "behind",
}

interface BasicGalaxyData {
  id: string;
  name: string;
  description: string;

  theme: GalaxyTheme;
  discoverable: boolean;
  category: GalaxyCategory;
  date: number;
  lastServerDate?: number;
  lastModificationData?: number;
  saveStatus?: SaveStatus;
}

export interface GalaxyDataExport extends BasicGalaxyData {
  tasks: SectorDataExport[];
}

export function deflateGalaxy(
  galaxy: GalaxyDataExport,
  tasks: Task[]
): GalaxyDataExport {
  const children: Task[] = [];
  const rest: Task[] = [];
  for (const task of tasks) {
    if (task.type == TaskType.SECTOR) {
      children.push(task);
    } else {
      rest.push(task);
    }
  }
  const deflatedChildren: SectorDataExport[] = [];
  for (const child of children) {
    deflatedChildren.push(deflateSector(child as Sector, rest));
  }
  return { ...galaxy, tasks: deflatedChildren };
}

export const createNewGalaxy = (
  name: string,
  description: string,
  theme: GalaxyTheme,
  discoverable: boolean
): GalaxyDataExport => {
  const data: GalaxyDataExport = {
    id: uuid(),
    name,
    description,
    theme,
    discoverable,
    category: GalaxyCategory.PROJECT,
    date: Date.now(),
    saveStatus: SaveStatus.NEED_TO_SAVE,

    tasks: [],
  };

  return data;
};
