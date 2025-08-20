import { useEffect, useState } from "react";
import { Loader2, Image as ImageIcon, Trash2, Upload } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

const HERO_IMAGE_KEYS = [
  { key: "barber1.jpg", label: "Barber 1 Image" },
  { key: "barber2.jpg", label: "Barber 2 Image" },
  { key: "barber3.jpg", label: "Barber 3 Image" },
];

const HeroSettings = () => {
  const [images, setImages] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchImages();
    // eslint-disable-next-line
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    const newImages: Record<string, string> = {};
    await Promise.all(
      HERO_IMAGE_KEYS.map(async ({ key }) => {
        const { data } = await supabase.storage.from("heroimage").getPublicUrl(key);
        if (data?.publicUrl) newImages[key] = `${data.publicUrl}?t=${Date.now()}`;
      })
    );
    setImages(newImages);
    setLoading(false);
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    key: string
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(key);
    const { error } = await supabase.storage.from("heroimage").upload(key, file, { upsert: true });
    setUploading(null);
    if (error) {
      toast({
        title: "Error uploading image",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Image uploaded successfully" });
      fetchImages();
    }
  };

  const deleteImage = async (key: string) => {
    const { error } = await supabase.storage.from("heroimage").remove([key]);
    if (error) {
      toast({
        title: "Error deleting image",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Image deleted successfully" });
      fetchImages();
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Hero Section Settings</h2>
        <div className="space-y-8">
          {HERO_IMAGE_KEYS.map(({ key, label }) => (
            <div key={key} className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
              <div className="flex items-center space-x-4">
                <div className="w-32 h-32 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden border">
                  {loading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
                  ) : images[key] ? (
                    <img src={images[key]} alt={label} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                <div className="flex flex-col space-y-2">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    id={`upload-${key}`}
                    className="hidden"
                    onChange={e => handleImageUpload(e, key)}
                    disabled={uploading === key}
                  />
                  <label
                    htmlFor={`upload-${key}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 cursor-pointer"
                  >
                    {uploading === key ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    {images[key] ? "Replace" : "Upload"}
                  </label>
                  {images[key] && (
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-500 hover:bg-red-600"
                      onClick={() => deleteImage(key)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSettings;
