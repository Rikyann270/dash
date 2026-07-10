import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Namasuba College of Commerce",
  shortName: "NCC",
  version: packageJson.version,
  copyright: `© ${currentYear}, Namasuba College of Commerce (NCC).`,
  logo: "/Ncc _logo.png",
  meta: {
    title: "Namasuba College of Commerce (NCC) - Dashboard",
    description: "Official admin and portal system for Namasuba College of Commerce (NCC).",
  },
};
