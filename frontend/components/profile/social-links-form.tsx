"use client";

import * as React from "react";
import { Link as LinkIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UseFormRegister } from "react-hook-form";
import { UpdateProfileInput } from "@/lib/validations/auth";

interface SocialLinksFormProps {
  register: UseFormRegister<UpdateProfileInput>;
}

export const SocialLinksForm = React.memo(function SocialLinksForm({ register }: SocialLinksFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center space-x-2">
          <LinkIcon className="h-5 w-5 text-brand-700" /><span>Social Links</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="GitHub" id="profile-github" placeholder="github.com/username" {...register("socialLinks.github")} />
          <Input label="LinkedIn" id="profile-linkedin" placeholder="linkedin.com/in/username" {...register("socialLinks.linkedin")} />
          <Input label="Twitter / X" id="profile-twitter" placeholder="twitter.com/username" {...register("socialLinks.twitter")} />
          <Input label="Facebook" id="profile-facebook" placeholder="facebook.com/username" {...register("socialLinks.facebook")} />
        </div>
      </CardContent>
    </Card>
  );
});
