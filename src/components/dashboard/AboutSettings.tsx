import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Upload, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const ABOUT_IMAGE_KEY = "about.jpg";

export const AboutSettings = () => {
  const [image, setImage] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchImage();
  }, []);

  const fetchImage = async () => {
    setLoading(true);
    const { data } = await supabase.storage.from("heroimage").getPublicUrl(ABOUT_IMAGE_KEY);
    setImage(data?.publicUrl ? `${data.publicUrl}?t=${Date.now()}` : "");
    setLoading(false);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { error } = await supabase.storage.from("heroimage").upload(ABOUT_IMAGE_KEY, file, { upsert: true });
    setUploading(false);
    if (error) {
      toast({ title: "Error uploading image", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "About image uploaded successfully" });
      fetchImage();
    }
  };

  const deleteImage = async () => {
    const { error } = await supabase.storage.from("heroimage").remove([ABOUT_IMAGE_KEY]);
    if (error) {
      toast({ title: "Error deleting image", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "About image deleted successfully" });
      fetchImage();
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden mt-8">
      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">About Section Image</h2>
        <div className="flex items-center space-x-4">
          <div className="w-40 h-40 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden border">
            {loading ? (
              <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
            ) : image ? (
              <img src={image} alt="About" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="h-12 w-12 text-gray-400" />
            )}
          </div>
          <div className="flex flex-col space-y-2">
            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              id="upload-about-image"
              className="hidden"
              onChange={handleImageUpload}
              disabled={uploading}
            />
            <label htmlFor="upload-about-image" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 cursor-pointer">
              {uploading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {image ? "Replace" : "Upload"}
            </label>
            {image && (
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-500 hover:bg-red-600"
                onClick={deleteImage}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
