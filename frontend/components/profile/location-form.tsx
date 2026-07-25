"use client";

import * as React from "react";
import { Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UseFormRegister } from "react-hook-form";
import { UpdateProfileInput } from "@/lib/validations/auth";
import { COUNTRIES } from "@/constants/countries";

interface LocationFormProps {
  register: UseFormRegister<UpdateProfileInput>;
}

export const LocationForm = React.memo(function LocationForm({ register }: LocationFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center space-x-2">
          <Globe className="h-5 w-5 text-brand-700" /><span>Location</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Country</label>
            <select className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-700/20" {...register("country")}>
              <option value="">Select country</option>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <Input label="State / Province" id="profile-state" placeholder="Maharashtra" {...register("state")} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="City" id="profile-city" placeholder="Mumbai" {...register("city")} />
          <Input label="Address" id="profile-address" placeholder="123 Main Street" {...register("address")} />
        </div>
      </CardContent>
    </Card>
  );
});
