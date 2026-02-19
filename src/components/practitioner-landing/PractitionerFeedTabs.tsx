import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Grid3X3, ShoppingBag, Star } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { PractitionerWithDetails } from '@/hooks/usePractitioners';
import PostsGrid from './PostsGrid';
import PractitionerCatalog from './PractitionerCatalogGrid';
import PractitionerReviewsList from './PractitionerReviewsList';

interface Props {
  practitioner: PractitionerWithDetails;
}

const PractitionerFeedTabs = ({ practitioner }: Props) => {
  const { isRTL } = useTranslation();

  return (
    <section className="pb-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto max-w-2xl">
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-transparent border-b border-border rounded-none h-12">
            <TabsTrigger
              value="posts"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <Grid3X3 className="h-5 w-5" />
            </TabsTrigger>
            <TabsTrigger
              value="products"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <ShoppingBag className="h-5 w-5" />
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <Star className="h-5 w-5" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-0">
            <PostsGrid userId={practitioner.user_id} />
          </TabsContent>

          <TabsContent value="products" className="mt-4">
            <PractitionerCatalog practitionerId={practitioner.id} />
          </TabsContent>

          <TabsContent value="reviews" className="mt-4">
            <PractitionerReviewsList practitioner={practitioner} />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default PractitionerFeedTabs;
