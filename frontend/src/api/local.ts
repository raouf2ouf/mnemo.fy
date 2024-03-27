import { Storage, Drivers } from "@ionic/storage";
import { GalaxyDataExport } from "@models/galaxy";

const storage = new Storage({
  name: "mnemofy",
  driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage],
});
storage.create();

export async function saveGalaxyLocally(galaxyData: GalaxyDataExport) {
  await storage.set(galaxyData.id, galaxyData);
}
export async function getGalaxyLocally(
  id: string
): Promise<GalaxyDataExport | undefined> {
  const res = (await storage.get(id)) as GalaxyDataExport | undefined;
  return res;
}

export async function getAllLocalGalaxies(): Promise<GalaxyDataExport[]> {
  const galaxiesData: GalaxyDataExport[] = [];
  const keys = await storage.keys();
  for (const key of keys) {
    const data = await storage.get(key);
    if (data?.id) {
      galaxiesData.push(data);
    }
  }
  return galaxiesData;
}
