{/* Online Customer Service */}
<Card 
  className="p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
  onClick={() => {
    if (settings.customer_service_link) {
      window.open(settings.customer_service_link, '_blank');
    }
  }}
>
  <div className="flex items-center gap-4">
    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
      <Headphones className="w-6 h-6 text-blue-500" />
    </div>
    <span className="font-medium">{settings.customer_service_message || 'Online customer service'}</span>
  </div>
  <ChevronRight className="w-5 h-5 text-gray-400" />
</Card>
