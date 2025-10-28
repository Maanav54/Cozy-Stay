# Updating Room Images

Place your room images in `backend/public/images/` with these filenames (or adjust the script):

- `normal.jpg` (for Normal rooms)
- `below.jpg` (for Below Average rooms)
- `deluxe.jpg` (for Deluxe rooms)
- `super.jpg` (for Super Deluxe rooms)

Then run this script from the repository root:

```powershell
cd E:\loki
node scripts/update-room-images.js
```

The script will connect to MongoDB (uses `MONGO_URI` env var if set) and update the `image` field on Room documents to `/images/<filename>`.
