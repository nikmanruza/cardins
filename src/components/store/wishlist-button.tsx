import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/use-auth";
import { addToWishlist, removeFromWishlist, wishlistQuery } from "@/lib/wishlist";
import { cn } from "@/lib/utils";

type Props = {
  productId: string;
  variant?: "button" | "icon";
  className?: string;
};

export function WishlistButton({ productId, variant = "button", className }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: items } = useQuery(wishlistQuery(user?.id));
  const entry = items?.find((item) => item.productId === productId);
  const saved = Boolean(entry);

  const toggle = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("sign-in-required");
      if (entry) await removeFromWishlist(entry.id);
      else await addToWishlist(user.id, productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success(saved ? "Removed from wishlist" : "Saved to wishlist");
    },
    onError: (error) => {
      if (error instanceof Error && error.message === "sign-in-required") {
        toast.info("Sign in to save products");
        navigate({ to: "/auth", search: { next: window.location.pathname } });
        return;
      }
      toast.error(error instanceof Error ? error.message : "Could not update your wishlist.");
    },
  });

  const icon = toggle.isPending ? (
    <Loader2 className="size-4 animate-spin" aria-hidden />
  ) : (
    <Heart className={cn("size-4", saved && "fill-primary text-primary")} aria-hidden />
  );

  if (variant === "icon") {
    return (
      <Button
        type="button"
        size="icon"
        variant="secondary"
        aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
        className={cn("size-8 rounded-full", className)}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          toggle.mutate();
        }}
      >
        {icon}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      size="lg"
      variant="secondary"
      className={className}
      onClick={() => toggle.mutate()}
      disabled={toggle.isPending}
    >
      {icon}
      <span className="ml-2">{saved ? "Saved" : "Save for later"}</span>
    </Button>
  );
}
