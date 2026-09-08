const db = require("../database/db");
const preferenceTools = require("./preferenceTools");

console.log("⚙️ Testing preferences...\n");

console.log("1️⃣ Save preference:");
console.log(
  preferenceTools.savePreference("language", "English")
);

console.log("\n2️⃣ Get preference:");
console.log(
  preferenceTools.getPreference("language")
);

console.log("\n3️⃣ Update preference:");
console.log(
  preferenceTools.savePreference("language", "Tamil")
);

console.log("\n4️⃣ Get updated preference:");
console.log(
  preferenceTools.getPreference("language")
);

console.log("\n5️⃣ Get all preferences:");
console.log(
  preferenceTools.getPreferences()
);

db.close();