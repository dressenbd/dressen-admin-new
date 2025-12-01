/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useCreatePromoCategoryMutation, useUpdatePromoCategoryMutation } from "@/redux/featured/promoCategories/promoCategoryApi";
import { useForm } from "react-hook-form";
import { ImagePlusIcon, XIcon } from "lucide-react";
import { FileWithPreview, useFileUpload } from "@/hooks/use-file-upload";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Image from "next/image";

type PromoCategoryFormValues = {
  name: string;
  description: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
};

export default function PromoCategory({
  children,
  type,
  editPromoCategory,
  refetch,
}: {
  children?: React.ReactNode;
  type?: string;
  editPromoCategory?: any;
  refetch?: any;
}) {
  const [createPromoCategory, { isLoading }] = useCreatePromoCategoryMutation();
  const [updatePromoCategory, { isLoading: editLoading }] = useUpdatePromoCategoryMutation();
  const [image, setImage] = useState<FileWithPreview | null>(null);
  const [open, setOpen] = useState(false);

  const { handleSubmit, register, setValue, watch, reset } = useForm<PromoCategoryFormValues>({
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
      startDate: "",
      endDate: "",
    },
  });

  useEffect(() => {
    if (editPromoCategory) {
      reset({
        name: editPromoCategory.name || "",
        description: editPromoCategory.description || "",
        isActive: editPromoCategory.isActive ?? true,
        startDate: editPromoCategory.startDate ? new Date(editPromoCategory.startDate).toISOString().split('T')[0] : "",
        endDate: editPromoCategory.endDate ? new Date(editPromoCategory.endDate).toISOString().split('T')[0] : "",
      });
    }
  }, [editPromoCategory, reset]);

  const onSubmit = async (data: PromoCategoryFormValues) => {
    const submitToast = toast.loading(type === "edit" ? "Updating..." : "Creating...");

    try {
      const formData = new FormData();
      
      // Append individual fields instead of JSON string
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("isActive", data.isActive.toString());
      
      if (data.startDate) {
        formData.append("startDate", data.startDate);
      }
      if (data.endDate) {
        formData.append("endDate", data.endDate);
      }
      
      if (image?.file) {
        formData.append("image", image.file as File);
      }

      if (type === "edit" && editPromoCategory?._id) {
        await updatePromoCategory({ id: editPromoCategory._id, formData }).unwrap();
        toast.success("Promo category updated!", { id: submitToast });
      } else {
        await createPromoCategory(formData).unwrap();
        toast.success("Promo category created!", { id: submitToast });
      }

      setOpen(false);
      reset();
      refetch();
      setImage(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Something went wrong!", { id: submitToast });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{children}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{type === "edit" ? "Edit Promo Category" : "Add Promo Category"}</DialogTitle>
        </DialogHeader>

        <form id="promo-category-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Image</Label>
            <ImageUpload setImage={setImage} editPromoCategory={editPromoCategory} />
          </div>

          <div>
            <Label>Name</Label>
            <Input placeholder="Flash Sale" {...register("name", { required: true })} />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea placeholder="Limited time offers" {...register("description", { required: true })} />
          </div>

          <div className="flex items-center gap-2">
            <Switch checked={watch("isActive")} onCheckedChange={(val) => setValue("isActive", val)} />
            <Label>Active</Label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date (Optional)</Label>
              <Input type="date" {...register("startDate")} />
            </div>
            <div>
              <Label>End Date (Optional)</Label>
              <Input type="date" {...register("endDate")} />
            </div>
          </div>
        </form>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button form="promo-category-form" type="submit" disabled={isLoading || editLoading}>
            {isLoading || editLoading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ImageUpload({ setImage, editPromoCategory }: { setImage: any; editPromoCategory?: any }) {
  const [{ files }, { removeFile, openFileDialog, getInputProps }] = useFileUpload({
    accept: "image/*",
    multiple: false,
    initialFiles: [],
  });

  useEffect(() => {
    if (files && files.length > 0) {
      setImage(files[0]);
    } else {
      setImage(null);
    }
  }, [files, setImage]);

  const currentImage = files[0]?.preview || null;
  const imageUrl = currentImage || editPromoCategory?.image || "https://via.placeholder.com/400x200?text=Promo+Image";

  return (
    <div className="relative w-full h-40 flex items-center justify-center overflow-hidden rounded-md bg-muted">
      <Image src={imageUrl} alt="Promo" className="object-cover w-full h-full" width={400} height={200} />
      <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 hover:opacity-100 transition">
        <button type="button" onClick={openFileDialog} className="rounded-full bg-white/80 p-2 hover:bg-white">
          <ImagePlusIcon size={20} />
        </button>
        {currentImage && (
          <button type="button" onClick={() => removeFile(files[0]?.id)} className="rounded-full bg-white/80 p-2 hover:bg-white">
            <XIcon size={20} />
          </button>
        )}
      </div>
      <input {...getInputProps()} className="sr-only" />
    </div>
  );
}
