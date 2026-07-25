"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Briefcase, Link as LinkIcon, Camera } from "lucide-react";
import { updateProfileSchema, UpdateProfileInput } from "@/lib/validations/auth";
import { updateProfileAction } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast";

import { PersonalInfoForm } from "@/components/profile/personal-info-form";
import { LocationForm } from "@/components/profile/location-form";
import { SocialLinksForm } from "@/components/profile/social-links-form";

interface ProfileClientProps {
  user: any;
}

export function ProfileClient({ user }: ProfileClientProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema) as any,
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      bio: user.bio,
      country: user.country,
      state: user.state,
      city: user.city,
      address: user.address,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      language: user.language,
      timezone: user.timezone,
      website: user.website,
      occupation: user.occupation,
      company: user.company,
      socialLinks: user.socialLinks,
    },
  });

  const onSubmit = async (data: UpdateProfileInput) => {
    setIsLoading(true);
    const res = await updateProfileAction(data);
    setIsLoading(false);
    toast({
      type: res.success ? "success" : "error",
      title: res.success ? "Profile updated!" : "Update failed",
      description: res.success ? "Your profile has been saved." : res.error,
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Personal Profile</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your personal information across all Onevriksh platforms.</p>
      </div>

      {/* Avatar Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-5">
            <div className="relative group cursor-pointer">
              <Avatar name={`${user.firstName} ${user.lastName}`} src={user.avatarUrl} size="xl" />
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-5 w-5 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{user.firstName} {user.lastName}</h2>
              <p className="text-sm text-slate-500">{user.email}</p>
              <Button variant="outline" size="sm" className="mt-3">
                <Camera className="mr-2 h-3.5 w-3.5" /> Change Photo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <PersonalInfoForm register={register} errors={errors} />

        <LocationForm register={register} />

        {/* Professional */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center space-x-2">
              <Briefcase className="h-5 w-5 text-brand-700" /><span>Professional</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Occupation" id="profile-occupation" placeholder="Software Engineer" {...register("occupation")} />
              <Input label="Company" id="profile-company" placeholder="Onevriksh Inc." {...register("company")} />
            </div>
            <Input label="Website" id="profile-website" type="url" placeholder="https://yourwebsite.com" leftIcon={<LinkIcon className="h-4 w-4" />} error={errors.website?.message} {...register("website")} />
          </CardContent>
        </Card>

        <SocialLinksForm register={register} />

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="lg" isLoading={isLoading} id="profile-save">
            Save Changes
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
