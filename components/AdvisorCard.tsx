import { Star, School } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ButtonLink } from '@/components/ui/button-link';
import type { Advisor } from '@/lib/data';

type Props = { advisor: Advisor };

export default function AdvisorCard({ advisor }: Props) {
  return (
    <div className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
      {/* Colored accent strip */}
      <div className={`h-1.5 w-full ${advisor.avatarColor}`} />

      <div className="flex flex-1 flex-col p-5 gap-4">
        {/* Header: avatar + name + university */}
        <div className="flex items-start gap-3">
          <Avatar className="h-14 w-14 shrink-0 ring-2 ring-background shadow-sm">
            <AvatarFallback className={`${advisor.avatarColor} text-white text-base font-bold`}>
              {advisor.initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-base text-foreground leading-tight truncate">{advisor.name}</p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">{advisor.major}</p>
            <div className="mt-1.5">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {advisor.universityShort}
              </span>
            </div>
          </div>
          <div className="shrink-0">
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">Free</span>
          </div>
        </div>

        {/* High school + rating */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 min-w-0">
            <School className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{advisor.highSchool}</span>
          </span>
          <span className="flex items-center gap-1 shrink-0 ml-2">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-foreground">{advisor.rating.toFixed(1)}</span>
            <span className="text-muted-foreground">({advisor.totalSessions})</span>
          </span>
        </div>

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Bio */}
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed flex-1">
          {advisor.bio}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {advisor.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs font-medium px-2 py-0.5 rounded-full">
              {tag}
            </Badge>
          ))}
        </div>

        {/* CTA */}
        <ButtonLink
          href={`/advisors/${advisor.id}`}
          className="w-full justify-center"
          size="sm"
        >
          View Profile & Schedule
        </ButtonLink>
      </div>
    </div>
  );
}
