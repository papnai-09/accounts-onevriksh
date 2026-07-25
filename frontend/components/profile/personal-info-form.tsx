"use client";

import * as React from "react";
import { User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { UpdateProfileInput } from "@/lib/validations/auth";
import { LANGUAGES } from "@/constants/languages";
import { TIMEZONES } from "@/constants/timezones";

interface PersonalInfoFormProps {
  register: UseFormRegister<UpdateProfileInput>;
  errors: FieldErrors<UpdateProfileInput>;
}

export const PersonalInfoForm = React.memo(function PersonalInfoForm({ register, errors }: PersonalInfoFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center space-x-2">
          <User className="h-5 w-5 text-brand-700" /><span>Personal Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="First Name" id="profile-firstname" {...register("firstName")} error={errors.firstName?.message} />
          <Input label="Last Name" id="profile-lastname" {...register("lastName")} error={errors.lastName?.message} />
        </div>
        <Input label="Username" id="profile-username" placeholder="yourusername" {...register("username")} error={errors.username?.message} />
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Bio</label>
          <textarea
            rows={3}
            placeholder="Tell the world a bit about yourself…"
            className="flex w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-3.5 py-2.5 text-sm font-medium text-slate-900 dark:text-slate-100 transition-all duration-200 placeholder:text-slate-400 focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-700/20 resize-none"
            {...register("bio")}
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Gender</label>
            <select className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-700/20" {...register("gender")}>
              <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <Input label="Date of Birth" id="profile-dob" type="date" {...register("dateOfBirth")} className="col-span-1" />
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Language</label>
            <select className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-700/20" {...register("language")}>
              {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Timezone</label>
            <select className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-700/20" {...register("timezone")}>
              {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
