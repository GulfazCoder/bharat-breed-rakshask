'use client';

import { useState } from 'react';
import { HelpCircle, Phone, Mail, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export default function HelpPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: 'How do I add a new animal to my farm?',
      answer: 'Go to the Animals page and click the "Add Animal" button. Fill in the required information including name, breed, age, and gender.'
    },
    {
      question: 'How does the AI breed classification work?',
      answer: 'Our AI uses advanced computer vision to analyze photos of your cattle or buffalo and identify the breed with high accuracy. Simply take a clear photo and the AI will provide classification results.'
    },
    {
      question: 'Can I use the app offline?',
      answer: 'Yes, many features work offline. Your data is stored locally and synced when you have an internet connection. AI classification requires an internet connection.'
    },
    {
      question: 'How do I track breeding cycles?',
      answer: 'Use the Breeding section to record mating dates, pregnancy status, and expected calving dates. The app will send you reminders for important dates.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, we take data security seriously. All data is encrypted and stored securely. You can export your data at any time.'
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3">
        <HelpCircle className="h-8 w-8 text-primary-green" />
        <div>
          <h1 className="text-3xl font-bold text-primary-green">Help & Support</h1>
          <p className="text-muted-foreground mt-1">Get help and find answers to common questions</p>
        </div>
      </div>

      {/* Contact Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Phone className="h-8 w-8 text-primary-green mx-auto mb-3" />
            <h3 className="font-medium mb-2">Phone Support</h3>
            <p className="text-sm text-muted-foreground mb-3">Mon-Fri, 9 AM - 6 PM</p>
            <Button variant="outline" size="sm">
              Call Now
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Mail className="h-8 w-8 text-medium-green mx-auto mb-3" />
            <h3 className="font-medium mb-2">Email Support</h3>
            <p className="text-sm text-muted-foreground mb-3">Response within 24 hours</p>
            <Button variant="outline" size="sm">
              Send Email
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <MessageCircle className="h-8 w-8 text-dark-green mx-auto mb-3" />
            <h3 className="font-medium mb-2">Live Chat</h3>
            <p className="text-sm text-muted-foreground mb-3">Available now</p>
            <Button variant="outline" size="sm">
              Start Chat
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {faqs.map((faq, index) => (
            <Collapsible key={index}>
              <CollapsibleTrigger
                className="flex items-center justify-between w-full p-4 text-left border rounded-lg hover:bg-muted"
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
              >
                <span className="font-medium">{faq.question}</span>
                {expandedFaq === index ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 pt-0">
                <p className="text-muted-foreground">{faq.answer}</p>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </CardContent>
      </Card>

      {/* Contact Form */}
      <Card>
        <CardHeader>
          <CardTitle>Send us a message</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input placeholder="Your name" />
            <Input placeholder="Email address" type="email" />
          </div>
          <Input placeholder="Subject" />
          <Textarea placeholder="Describe your issue or question..." rows={4} />
          <Button className="w-full">Send Message</Button>
        </CardContent>
      </Card>

      {/* About Section */}
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="space-y-2">
            <h3 className="font-medium text-primary-green">Bharat Breed Rakshask</h3>
            <p className="text-sm text-dark-green">
              Built with ❤️ by Team Codeyodhaa
            </p>
            <p className="text-xs text-muted-foreground">
              Empowering Indian farmers with modern technology
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
